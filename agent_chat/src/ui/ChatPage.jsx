import * as React from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Paper,
  InputAdornment,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ClearIcon from "@mui/icons-material/Clear";

// Utility for avatar initials
function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";
}

export default function ChatPage({ agent }) {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [connected, setConnected] = React.useState(false);
  const wsRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);

  // Scroll to bottom on new message
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Connect to WebSocket server and setup handlers
  React.useEffect(() => {
    if (!agent || !agent._id) return;

    // Construct your WebSocket URL (wss for secure, ws otherwise)
    // Adjust to your actual server address and port
    const wsUrl = "wss://agent.chat.app:6121/v1/agents/chat";

    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);

      // Display initial greeting from agent
      setMessages([
        {
          id: "init",
          from: "agent",
          text: `Hello! I am ${agent.name}. How can I help you today?`,
          timestamp: new Date(),
        },
      ]);
      wsRef.current.send(JSON.stringify({}));
    };

    ws.onmessage = (event) => {
      try {
        // Assuming server sends plain text messages; if JSON, parse accordingly
        const data = event.data;
        const { from, text } = JSON.parse(data);
        // Add new message from agent
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + Math.random()).toString(),
            from: from,
            text: text,
            timestamp: new Date(),
          },
        ]);
      } catch (e) {
        console.error("Error parsing message:", e);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          from: "system",
          text: "Connection error occurred.",
          timestamp: new Date(),
        },
      ]);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: "system",
          text: "Disconnected from server.",
          timestamp: new Date(),
        },
      ]);
    };

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnected(false);
    };
  }, [agent]);

  // Send user message over WebSocket
  const handleSend = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
      return;

    // Add message to UI immediately
    const userMessage = {
      id: Date.now().toString(),
      from: "user",
      text: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      wsRef.current.send(JSON.stringify(userMessage));
      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          from: "system",
          text: "Failed to send message.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleClearInput = () => setInput("");

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        borderRadius: 0,
        border: "none",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "background.paper",
        boxShadow: "none",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
          userSelect: "none",
        }}
      >
        <Avatar sx={{ bgcolor: "primary.light", fontWeight: "bold", fontSize: 20 }}>
          {getInitials(agent.name)}
        </Avatar>
        <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
          {agent.name}
        </Typography>
        {!connected && (
          <Typography
            variant="body2"
            sx={{
              ml: 2,
              color: "warning.main",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CircularProgress size={16} /> Connecting...
          </Typography>
        )}
      </Box>

      {/* Messages List */}
      <Box
        sx={{
          flex: 1,
          p: 3,
          overflowY: "auto",
          backgroundColor: "#f5f7fa",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          scrollbarWidth: "thin",
          scrollbarColor: "#c0c0c0 transparent",
          "&::-webkit-scrollbar": {
            width: 6,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c0c0c0",
            borderRadius: 3,
          },
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.from === "user";
          const isSystem = msg.from === "system";
          return (
            <Box
              key={msg.id}
              sx={{
                maxWidth: "75%",
                alignSelf: isUser ? "flex-end" : isSystem ? "center" : "flex-start",
                bgcolor: isUser
                  ? "primary.main"
                  : isSystem
                  ? "grey.400"
                  : "grey.200",
                color: isUser ? "primary.contrastText" : "text.primary",
                borderRadius: 3,
                p: 1.8,
                boxShadow: 1,
                wordBreak: "break-word",
                fontSize: 14,
                fontStyle: isSystem ? "italic" : "normal",
                position: "relative",
                "&::after":
                  !isSystem && {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    width: 0,
                    height: 0,
                    borderStyle: "solid",
                    borderWidth: isUser ? "0 0 10px 10px" : "10px 10px 0 0",
                    borderColor: isUser
                      ? `transparent transparent #1976d2 transparent`
                      : `#e0e0e0 transparent transparent transparent`,
                    right: isUser ? -10 : "auto",
                    left: isUser ? "auto" : -10,
                    filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.05))",
                  },
              }}
            >
              <Typography variant="body1">{msg.text}</Typography>
              {!isSystem && (
                <Typography
                  variant="caption"
                  sx={{ display: "block", textAlign: "right", mt: 0.5, opacity: 0.6 }}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              )}
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        sx={{
          p: "6px 12px",
          display: "flex",
          alignItems: "center",
          bgcolor: "background.paper",
          boxShadow: "inset 0 1px 3px rgb(0 0 0 / 0.1)",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          size="medium"
          fullWidth
          autoComplete="off"
          disabled={!connected}
          InputProps={{
            endAdornment: input && (
              <InputAdornment position="end">
                <Tooltip title="Clear">
                  <IconButton
                    onClick={handleClearInput}
                    size="small"
                    edge="end"
                    aria-label="clear message"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!input.trim() || !connected}
          aria-label="send message"
          sx={{ ml: 1 }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}
