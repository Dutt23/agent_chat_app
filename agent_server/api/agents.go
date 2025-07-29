package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/quic-go/webtransport-go"
	clients "github.com/sdutt/agentserver/clients/lyzr"
	"github.com/sdutt/agentserver/configs"
	lyzr "github.com/sdutt/agentserver/models/lyzr"
)

type agentApi struct {
	config     *configs.AppConfig
	lyzrClient *clients.LyzrClient
	ws         *webtransport.Server
}

func NewAgentApi(config *configs.AppConfig, lyzr_client *clients.LyzrClient, ws *webtransport.Server) *agentApi {
	return &agentApi{config, lyzr_client, ws}
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
	resp, err := api.lyzrClient.CreateAgent(c.Request.Context(), payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (api *agentApi) ListAgents(c *gin.Context) {
	resp, err := api.lyzrClient.ListAgents(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (api *agentApi) Chat(c *gin.Context) {
	sess, err := api.ws.Upgrade(c.Writer, c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	defer sess.CloseWithError(0, "bye")
	stream, err := sess.AcceptStream(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	buf := make([]byte, 1024)
	for {
		_, err := stream.Read(buf)
		if err != nil {
			break
		}
	}
}
