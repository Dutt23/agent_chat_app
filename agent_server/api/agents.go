package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
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

type Message struct {
	ID        string `json:"id"`
	From      string `json:"from"`
	Text      string `json:"text"`
	Timestamp string `json:"timestamp"`
}

func (api *agentApi) Chat(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	sess, err := api.ws.Upgrade(w, r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer sess.CloseWithError(0, "bye")
	stream, err := sess.AcceptStream(ctx)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
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

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for demo; restrict in prod!
	},
}

func (api *agentApi) ChatWs(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer conn.Close()

	// Wait for an initial client message before entering main loop
	res, msgBytes, err := conn.ReadMessage()
	if err != nil {
		log.Printf("Read error during handshake: %v %v", err, res)
		return
	}

	log.Printf("Initial message from client: %s", string(msgBytes))

	for {

		_, msgBytes, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Read error: %v", err)
			break
		}

		// Print the raw message as a string
		log.Printf("Received: %s", string(msgBytes))
		var msg Message
		err = json.Unmarshal(msgBytes, &msg)
		if err != nil {
			log.Printf("Unmarshal error: %v", err)
			continue
		}
		log.Printf("Deserialized struct: %+v", msg)

		// Optionally do something with msg here

		// Echo back the message as JSON
		msg.From = "agent"
		msg.Text = fmt.Sprintf("Hello %s", msg.Text)
		err = conn.WriteJSON(msg)
		if err != nil {
			log.Printf("Write error: %v", err)
			break
		}
	}
}
