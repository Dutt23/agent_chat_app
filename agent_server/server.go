package main

import (
	"context"
	"crypto/tls"

	"github.com/gin-gonic/gin"
	"github.com/quic-go/quic-go/http3"
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

type routerOpts struct{
	router *gin.Engine
	config *configs.AppConfig
	lyzr_client *clients.LyzrClient
}

func NewServer(config *configs.AppConfig) (*Server, error) {
	server := &Server{
		config: config,
	}

	server.AllConnectors()
	router := gin.Default()
	lyzr_client := clients.NewLyzrClient(config)
	opts := &routerOpts{
		router: router,
		config: config,
		lyzr_client: lyzr_client,
	}

	server.setupRouter(opts)
	cert, err := tls.LoadX509KeyPair("server.crt", "server.key")
	if err != nil {
		return nil, err
	}
	tlsConf := &tls.Config{
		Certificates: []tls.Certificate{cert},
	}
	server.S = &http3.Server{
		Addr:      ":8443",
		Handler:   router, // <-- Gin router (handles all routes
		TLSConfig: http3.ConfigureTLSConfig(tlsConf)}

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
}

func (server *Server) addAgentRoutes(grp *gin.RouterGroup, opts *routerOpts) { 
	agentHandler := api.NewAgentApi(opts.config)
	grp.POST("/agents", agentHandler.CreateAgent)
}
	

