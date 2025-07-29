package api

import (
	"github.com/gin-gonic/gin"
	"github.com/sdutt/agentserver/configs"
)

type agentApi struct {
  config *configs.AppConfig

}

func NewAgentApi(config *configs.AppConfig, ) *agentApi {
	return &agentApi{config}
}

func (api *agentApi) CreateAgent(router *gin.RouterGroup) {
	
}