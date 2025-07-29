package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sdutt/agentserver/configs"
	lyzr "github.com/sdutt/agentserver/models/lyzr"
)

type agentApi struct {
	config *configs.AppConfig
}

func NewAgentApi(config *configs.AppConfig) *agentApi {
	return &agentApi{config}
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
}
