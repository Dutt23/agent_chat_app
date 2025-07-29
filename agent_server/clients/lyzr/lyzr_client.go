package clients

import (
	"context"
	"net/http"

	"github.com/sdutt/agentserver/configs"
	models "github.com/sdutt/agentserver/models/lyzr"
)

type LyzrClient struct {
	config *configs.AppConfig
}

func NewLyzrClient(config *configs.AppConfig) *LyzrClient {
	return &LyzrClient{config}
}


func (client *LyzrClient) CreateAgent(ctx context.Context, payload models.AgentPayload) (*AgentResponse, error) {
	url := client.config.LyzrAPIURL + "/v3/agents"
	headers := map[string]string{
		"Authorization": "Bearer " + client.config.LyzrAPIKey,
	}
	return CallAndUnmarshal[AgentResponse](
		ctx, http.MethodPost, url, payload, headers,
	)
}
