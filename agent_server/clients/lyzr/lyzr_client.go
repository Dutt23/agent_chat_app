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
	url := client.config.LyzrAPIURL + "/v3/agents/"
	headers := map[string]string{
		"x-api-key": client.config.LyzrAPIKey,
	}
	return CallAndUnmarshal[AgentResponse](
		ctx, http.MethodPost, url, payload, headers,
	)
}

func (client *LyzrClient) ListAgents(ctx context.Context) ([]Agent, error) {
	url := client.config.LyzrAPIURL + "/v3/agents/"
	headers := map[string]string{
		"x-api-key": client.config.LyzrAPIKey,
		"accept":    "application/json",
	}
	resp, err := CallAndUnmarshal[[]Agent](
		ctx, http.MethodGet, url, nil, headers,
	)
	return *resp, err
}

func (client *LyzrClient) CreateCredentials(ctx context.Context, payload models.CredentialPayload) (*AgentResponse, error) {
	url := client.config.LyzrAPIURL + "/v3/tools/credentials"
	headers := map[string]string{
		"x-api-key": client.config.LyzrAPIKey,
		"accept":    "application/json",
	}
	return CallAndUnmarshal[AgentResponse](
		ctx, http.MethodPost, url, payload, headers,
	)
}
