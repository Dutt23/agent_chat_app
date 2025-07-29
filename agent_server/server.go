package main

import (
	"context"
	"crypto/tls"
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/quic-go/quic-go"
	"github.com/quic-go/quic-go/http3"
	"github.com/quic-go/quic-go/qlog"
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
}

type routerOpts struct {
	router      *gin.Engine
	config      *configs.AppConfig
	lyzr_client *clients.LyzrClient
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
	opts := &routerOpts{
		router:      router,
		config:      config,
		lyzr_client: lyzr_client,
	}

	server.setupRouter(opts)

	cert, err := tls.LoadX509KeyPair(config.CertPath, config.KeyPath)

	if err != nil {
		return nil, err
	}

	server.S = &http3.Server{
		Addr:    fmt.Sprintf(":%d", config.Port),
		Handler: router,
		QUICConfig: &quic.Config{
			Tracer: qlog.DefaultConnectionTracer,
		},
		TLSConfig: &tls.Config{
			Certificates: []tls.Certificate{cert},
		},
	}
	server.E = router
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
	agentHandler := api.NewAgentApi(opts.config, opts.lyzr_client)
	grp.POST("/agents", agentHandler.CreateAgent)
}

func (server *Server) addCredentialRoutes(grp *gin.RouterGroup, opts *routerOpts) {
	credentialHandler := api.NewCredentialsApi(opts.config, opts.lyzr_client)
	grp.POST("/credentials", credentialHandler.CreateCredential)
}
