package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	clients "github.com/sdutt/agentserver/clients/lyzr"
	"github.com/sdutt/agentserver/configs"
	lyzr "github.com/sdutt/agentserver/models/lyzr"
)

type agentApi struct {
	config     *configs.AppConfig
	lyzrClient *clients.LyzrClient
}

func NewAgentApi(config *configs.AppConfig, lyzr_client *clients.LyzrClient) *agentApi {
	return &agentApi{config, lyzr_client}
}

func (api *agentApi) CreateAgent(c *gin.Context) {
	var payload lyzr.AgentPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
		return
	}
	if err := payload.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed: " + err.Error()})
		return
	}
	api.lyzrClient.CreateAgent(c.Request.Context(), payload)
}
