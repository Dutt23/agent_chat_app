package clients

import (
	"context"
	"net/http"

	"github.com/sdutt/agentserver/configs"
	models "github.com/sdutt/agentserver/models/lyzr"
)

type lyzrClient struct {
	config *configs.AppConfig
}

func NewLyzrClient(config *configs.AppConfig) *lyzrClient {
	return &lyzrClient{config}
}

type AgentResponse struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Status string `json:"status"`
}

func (client *lyzrClient) CreateAgent(ctx context.Context, payload models.AgentPayload) (*AgentResponse, error) {
	url := client.config.LyzrAPIURL + "/v3/agents"
	headers := map[string]string{
		"Authorization": "Bearer " + client.config.LyzrAPIKey,
	}
	return CallAndUnmarshal[AgentResponse](
		ctx, http.MethodPost, url, payload, headers,
	)
}
