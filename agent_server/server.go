package main

import (
	"context"
	"crypto/tls"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/quic-go/quic-go"
	"github.com/quic-go/quic-go/http3"
	"github.com/quic-go/quic-go/qlog"
	"github.com/quic-go/webtransport-go"
	"github.com/sdutt/agentserver/api"
	clients "github.com/sdutt/agentserver/clients/lyzr"
	"github.com/sdutt/agentserver/configs"
	"github.com/sdutt/agentserver/pkg/connectors"
)

type Server struct {
	config    *configs.AppConfig
	DB        connectors.SqliteConnector
	Closeable []func(context.Context) error
	E         *gin.Engine
	S         *http3.Server
	WS        *webtransport.Server
}

type routerOpts struct {
	router      *gin.Engine
	config      *configs.AppConfig
	lyzr_client *clients.LyzrClient
	ws          *webtransport.Server
	mux         *http.ServeMux
}

func NewServer(config *configs.AppConfig) (*Server, error) {
	server := &Server{
		config: config,
	}

	server.AllConnectors()
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowAllOrigins:  true, // <--- Allows all origins
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
		// Optionally set more fields here
	}))
	lyzr_client := clients.NewLyzrClient(config)

	cert, err := tls.LoadX509KeyPair(config.CertPath, config.KeyPath)

	if err != nil {
		return nil, err
	}

	mux := http.NewServeMux()
	server.S = &http3.Server{
		Addr:    config.GetHttpURL(),
		Handler: router,
		QUICConfig: &quic.Config{
			Tracer: qlog.DefaultConnectionTracer,
		},
		TLSConfig: &tls.Config{
			Certificates: []tls.Certificate{cert},
		},
	}

	webTransportTls := &tls.Config{
		Certificates: []tls.Certificate{cert},
		NextProtos:   []string{"h3"},
	}

	server.WS = &webtransport.Server{
		H3: http3.Server{
			Addr:      config.GetWebTransportURL(),
			TLSConfig: webTransportTls,
			Handler:   mux,
		},
	}

	server.E = router

	opts := &routerOpts{
		router:      router,
		config:      config,
		lyzr_client: lyzr_client,
		ws:          server.WS,
		mux:         mux,
	}

	server.setupRouter(opts)
	// server.WS.H3.Handler = server.E
	return server, nil
}

func (s *Server) AllConnectors() {
	sql := connectors.NewSqliteConnector(&s.config.DbConfig)
	s.DB = sql
}

func (server *Server) setupRouter(opts *routerOpts) {
	apiv1 := opts.router.Group("/v1/")
	server.addAgentRoutes(apiv1, opts)
	server.addCredentialRoutes(apiv1, opts)
}

func (server *Server) addAgentRoutes(grp *gin.RouterGroup, opts *routerOpts) {
	agentHandler := api.NewAgentApi(opts.config, opts.lyzr_client, opts.ws)
	grp.POST("/agents", agentHandler.CreateAgent)
	grp.GET("/agents", agentHandler.ListAgents)
	grp.GET("/agents/chat", agentHandler.ChatWs)
	// opts.router.GET("/agents/chat", agentHandler.Chat)
	// opts.mux.HandleFunc("/agents/chat", agentHandler.Chat)
}

func (server *Server) addCredentialRoutes(grp *gin.RouterGroup, opts *routerOpts) {
	credentialHandler := api.NewCredentialsApi(opts.config, opts.lyzr_client)
	grp.POST("/credentials", credentialHandler.CreateCredential)
}
