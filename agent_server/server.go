package main

import (
	"context"
	"crypto/tls"

	"github.com/gin-gonic/gin"
	"github.com/quic-go/quic-go/http3"
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

type routerOpts struct{}

func NewServer(config *configs.AppConfig) (*Server, error) {
	server := &Server{
		config: config,
	}

	// Init storages
	server.AllConnectors()

	opts := &routerOpts{}
	server.setupRouter(opts)
	router := gin.Default()
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
	return server, nil
}

func (s *Server) AllConnectors() {
	sql := connectors.NewSqliteConnector(&s.config.DbConfig)
	s.DB = sql
}

func (server *Server) setupRouter(opts *routerOpts) {
	router := gin.Default()
	// apiv1 := router.Group("/v1/")
	server.E = router
}
