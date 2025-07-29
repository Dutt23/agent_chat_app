package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	clients "github.com/sdutt/agentserver/clients/lyzr"
	"github.com/sdutt/agentserver/configs"
	lyzr "github.com/sdutt/agentserver/models/lyzr"
)

type credentialsApi struct {
	config     *configs.AppConfig
	lyzrClient *clients.LyzrClient
}

func NewCredentialsApi(config *configs.AppConfig, lyzr_client *clients.LyzrClient) *credentialsApi {
	return &credentialsApi{config, lyzr_client}
}

func (api *credentialsApi) CreateCredential(ctx *gin.Context) {
	var payload lyzr.CredentialPayload
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
		return
	}
	resp, err := api.lyzrClient.CreateCredentials(ctx.Request.Context(), payload)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, err)
		return
	}
	ctx.JSON(http.StatusOK, resp)
}
