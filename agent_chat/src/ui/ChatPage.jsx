import * as React from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  IconButton,

  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useLocation } from 'react-router-dom';
// Utility for avatar initials (reuse yours)
function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";
}

// Example chat message shape
// {
//   id: string | number,
//   from: "user" | "agent",
//   text: string,
//   timestamp: Date
// }

export default function ChatPage() {
  const location = useLocation();
  const agent = location.state?.agent;
  const [messages, setMessages] = React.useState([
    // Initial system message or greeting from the agent
    {
      id: 1,
      from: "agent",
      text: `Hello! I am ${agent.name}. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      from: "user",
      text: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // TODO: Integrate with backend/chatbot here
    // For now, simulate a reply after 1 sec
    setTimeout(() => {
      const replyMessage = {
        id: Date.now() + 1,
        from: "agent",
        text: `You said: "${userMessage.text}". I'm here to assist.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, replyMessage]);
    }, 1000);
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        height: "80vh",
        mx: "auto",
        my: 4,
        display: "flex",
        flexDirection: "column",
        border: "1px solid #ccc",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Agent Header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar sx={{ bgcolor: "primary.light" }}>
          {getInitials(agent.name)}
        </Avatar>
        <Typography variant="h6">{agent.name}</Typography>
      </Box>

      {/* Messages List */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              maxWidth: "80%",
              alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
              bgcolor: msg.from === "user" ? "primary.main" : "grey.300",
              color: msg.from === "user" ? "primary.contrastText" : "text.primary",
              borderRadius: 2,
              p: 1.5,
              boxShadow: 1,
            }}
          >
            <Typography variant="body1">{msg.text}</Typography>
            <Typography
              variant="caption"
              sx={{ display: "block", textAlign: "right", mt: 0.5 }}
            >
              {msg.timestamp.toLocaleTimeString()}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Input Area */}
      <Paper
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        sx={{ p: "4px 8px", display: "flex", alignItems: "center" }}
      >
        <TextField
          variant="outlined"
          placeholder="Type your message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          size="small"
          fullWidth
        />
        <IconButton color="primary" onClick={handleSend} sx={{ ml: 1 }}>
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}
