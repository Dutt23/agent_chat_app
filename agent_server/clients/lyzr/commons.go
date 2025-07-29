package clients

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

// APIError as before...
type APIError struct {
	StatusCode int
	Message    string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("API error: %s (status %d)", e.Message, e.StatusCode)
}

type AgentResponse struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Status  string `json:"status"`
	Message string `json:"message"`
	AgentId string `json:"agent_id"`
}

type Agent struct {
	ID                   string                 `json:"_id"`
	ApiKey               string                 `json:"api_key"`
	Name                 string                 `json:"name"`
	Description          string                 `json:"description"`
	AgentRole            *string                `json:"agent_role"`             // nullable
	AgentInstructions    *string                `json:"agent_instructions"`     // nullable
	AgentGoal            *string                `json:"agent_goal"`             // nullable
	AgentContext         interface{}            `json:"agent_context"`          // could be null/any
	AgentOutput          interface{}            `json:"agent_output"`           // could be null/any
	Examples             interface{}            `json:"examples"`               // could be null/any
	Features             []interface{}          `json:"features"`               // empty slice on some, can contain values
	Tool                 string                 `json:"tool,omitempty"`         // sometimes present, sometimes absent
	Tools                []interface{}          `json:"tools,omitempty"`        // sometimes present, sometimes absent
	ToolUsageDescription interface{}            `json:"tool_usage_description"` // can be string, object or null
	ResponseFormat       map[string]interface{} `json:"response_format"`        // sometimes "type":"text", sometimes empty object
	ProviderID           string                 `json:"provider_id"`
	Model                string                 `json:"model"`
	TopP                 float64                `json:"top_p"`
	Temperature          float64                `json:"temperature"`
	ManagedAgents        interface{}            `json:"managed_agents"` // could be []interface{}, null, or absent
	Version              string                 `json:"version"`
	CreatedAt            string                 `json:"created_at"`
	UpdatedAt            string                 `json:"updated_at"`
	LLM_CredentialID     string                 `json:"llm_credential_id"`
	TemplateType         string                 `json:"template_type,omitempty"` // sometimes present
}

type ListAgentResponse struct {
	Agents []Agent `json:"agents"`
}

var (
	transport = &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 100,
		IdleConnTimeout:     90 * time.Second,
		TLSHandshakeTimeout: 10 * time.Second,
		// Optionally, you can tune TLS settings if desired:
		TLSClientConfig: &tls.Config{
			MinVersion: tls.VersionTLS12,
			// InsecureSkipVerify: true, // Not recommended for production!
		},
		// For HTTPS, no need for DialContext/Nagle. Go handles this.
	}
	sharedClient *http.Client
	once         sync.Once
)

func getHTTPClient() *http.Client {
	once.Do(func() {
		sharedClient = &http.Client{
			Transport: transport,
			Timeout:   15 * time.Second,
		}
	})
	return sharedClient
}

func CallAndUnmarshal[T any](
	ctx context.Context,
	method, url string,
	payload interface{},
	headers map[string]string,
) (*T, error) {
	respBody, err := MakeAPICall(ctx, method, url, payload, headers)
	if err != nil {
		var apiErr *APIError
		if errors.As(err, &apiErr) {
			fmt.Printf("API error: status %d\nFull response body:\n%s\n", apiErr.StatusCode, apiErr.Message)
		} else {
			fmt.Printf("Network/request failure: %v\n", err)
		}
		return nil, err
	}
	var out T
	if err := json.Unmarshal(respBody, &out); err != nil {
		fmt.Printf("Failed to unmarshal response. Raw body:\n%s\n", string(respBody))
		return nil, fmt.Errorf("failed to unmarshal: %w", err)
	}
	return &out, nil
}

func MakeAPICall(
	ctx context.Context,
	method, url string,
	payload interface{},
	headers map[string]string,
) ([]byte, error) {
	var body io.Reader
	if payload != nil {
		jsonData, err := json.Marshal(payload)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal payload: %w", err)
		}
		body = bytes.NewReader(jsonData)
	}

	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	client := getHTTPClient()

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode >= 300 {
		return nil, &APIError{StatusCode: resp.StatusCode, Message: string(respBody)}
	}

	return respBody, nil
}
