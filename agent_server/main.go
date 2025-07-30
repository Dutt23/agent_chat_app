package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sdutt/agentserver/configs"
)

type AppRunner struct {
	server    *Server
	Closeable []func(context.Context) error
}

func main() {
	ctx := context.Background()
	appRunner := AppRunner{}
	// resolving configuration
	cfg, err := appRunner.ResolveConfig()
	if err != nil {
		panic(err)
	}
	s, err := NewServer(cfg)
	if err != nil {
		panic(err)
	}
	appRunner.server = s
	appRunner.Init(ctx)
	defer appRunner.close(ctx)
	go appRunner.RunHttpTLSServer()
	go appRunner.RunHttpServer()
	go appRunner.RunWebtransportServer(ctx)
	appRunner.RunHttp3Server()

}

func (app *AppRunner) RunHttpTLSServer() {
	log.Fatal(http.ListenAndServeTLS(app.server.config.GetHttpURL(), app.server.config.CertPath, app.server.config.KeyPath, app.server.E))
}

func (app *AppRunner) RunHttpServer() {
	log.Fatal(http.ListenAndServe(app.server.config.GetHttpUrl(), app.server.E))
}

func (app *AppRunner) RunHttp3Server() {
	log.Fatal(app.server.S.ListenAndServe())
}

func (app *AppRunner) RunWebtransportServer(ctx context.Context) {
	log.Fatal(app.server.WS.ListenAndServe())
}

func (app *AppRunner) ResolveConfig() (*configs.AppConfig, error) {
	vConfig, err := configs.InitConfig()
	if err != nil {
		log.Fatalf("Unable to parse viper config to application configuration : %v", err)
		return nil, err
	}

	cfg, err := configs.GetApplicationConfig(vConfig)
	if err != nil {
		log.Fatalf("Unable to parse viper config to application configuration : %v", err)
		return nil, err
	}

	gin.SetMode(gin.ReleaseMode)
	// debug mode of gin when runing log in debug mode.
	if cfg.LogLevel == "debug" {
		gin.SetMode(gin.DebugMode)
	}
	return cfg, nil
}

func (app *AppRunner) Init(ctx context.Context) error {
	err := app.server.DB.Connect(ctx)
	if err != nil {
		fmt.Println("error while connecting to postgres.", err)
		return err
	}
	app.Closeable = append(app.Closeable, app.server.DB.Disconnect)

	return nil
}

func (app *AppRunner) close(ctx context.Context) {
	if len(app.Closeable) > 0 {
		fmt.Println("there are closeable references to closed")
		for _, closeable := range app.Closeable {
			err := closeable(ctx)
			if err != nil {
				fmt.Println("error while closing %v", err)
			}
		}
	}
}
