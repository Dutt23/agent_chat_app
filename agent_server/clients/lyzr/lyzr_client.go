package clients

import "github.com/sdutt/agentserver/configs"

type lyzrClient struct {
	config *configs.AppConfig
}

func NewLyzrClient(config *configs.AppConfig) *lyzrClient {
	return &lyzrClient{config}
}

func (client *lyzrClient) CreateAgent() {
	
}