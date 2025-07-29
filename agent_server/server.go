package main

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/sdutt/agentserver/configs"
	"github.com/sdutt/agentserver/pkg/connectors"
)


type Server struct {
	config       *configs.AppConfig
	DB           connectors.SqliteConnector
	Closeable    []func(context.Context) error
	E            *gin.Engine
}

type routerOpts struct {}

func NewServer(config *configs.AppConfig) (*Server, error) {
  server := &Server{
    config: config,
    }

    // Init storages
	server.AllConnectors()

  opts := &routerOpts{}
  server.setupRouter(opts)
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