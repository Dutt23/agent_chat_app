package models

import "github.com/go-playground/validator"

type CredentialPayload struct {
	Name        string                 `json:"name"`
	ProviderID  string                 `json:"provider_id"`
	Credentials map[string]string      `json:"credentials"`
	MetaData    map[string]interface{} `json:"meta_data"`
}

type Feature struct {
	Type     string                 `json:"type" validate:"required"`
	Config   map[string]interface{} `json:"config" validate:"required"` // can be empty object
	Priority int                    `json:"priority" validate:"gte=0"`  // non-negative
}

type AgentPayload struct {
	Name            string                 `json:"name" validate:"required"`
	SystemPrompt    string                 `json:"system_prompt" validate:"required"`
	Description     string                 `json:"description"`
	Features        []Feature              `json:"features"`
	Tools           []string               `json:"tools"`
	LLMCredentialID string                 `json:"llm_credential_id" validate:"required"`
	ProviderID      string                 `json:"provider_id" validate:"required"`
	Model           string                 `json:"model" validate:"required"`
	TopP            float64                `json:"top_p" validate:"required,gte=0,lte=1"`
	Temperature     float64                `json:"temperature" validate:"required,gte=0,lte=2"`
	ResponseFormat  map[string]interface{} `json:"response_format" validate:"required"`
}

func (req *AgentPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(req)
}
