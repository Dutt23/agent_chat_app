import * as React from "react";
import {
  Box,
  Grid,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import AgentMenu from "../common/AgentMenu";
import { listAgent } from "../../api/agentApi"; // Assume your API

// Utility to split array into chunks
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// Utility for Avatar initials
function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";
}

export function AgentListPage() {
  const { data: agents, isLoading, isError } = useQuery({
    queryKey: ["agents"],
    queryFn: listAgent,
  });

  const agentsChunks = agents ? chunkArray(agents, 3) : [];

  const [activeAgentForWidget, setActiveAgentForWidget] = React.useState(null);

  const handleEdit = (agentId, event) => {
    console.log("Edit agent:", agentId);
  };

  const handleDelete = (agentId, event) => {
    console.log("Delete agent:", agentId);
  };

  const handleDuplicate = (agentId, event) => {
    console.log("Duplicate agent:", agentId);
  };

  // New handler to show the chat widget
  const handleShowWidget = (agent) => {
    setActiveAgentForWidget(agent);
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">Unable to load agents.</Alert>
      </Box>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography>No agents found.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 4,
        px: 0,
        bgcolor: "#f8fafd",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 6 },
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={4} color="text.primary">
          Agents
        </Typography>

        {agentsChunks.map((chunk, idx) => (
          <Grid container spacing={4} key={`row-${idx}`} sx={{ mb: 2 }}>
            {chunk.map((agent) => (
              <Grid item xs={12} sm={4} key={agent._id} sx={{ width: "100%" }}>
                <Card
                  elevation={3}
                  sx={{
                    height: 160,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    position: "relative",
                    borderRadius: 3,
                    px: 2,
                    py: 2,
                    width: "100%",
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-2px)",
                      transition: "all 0.2s ease-in-out",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <AgentMenu
                    agentId={agent._id}
                    agent={agent}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onShowWidget={handleShowWidget} // pass handler here
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 1,
                      gap: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 54,
                        height: 54,
                        bgcolor: "primary.light",
                        fontWeight: 600,
                        color: "primary.dark",
                        fontSize: 22,
                      }}
                    >
                      {getInitials(agent.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {agent.name || "Unnamed Agent"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {agent.description || "No description provided."}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ))}

        {/* Floating Chat Widget/Icon */}
        {activeAgentForWidget && (
          <Box
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              zIndex: 1300,
              bgcolor: "primary.main",
              borderRadius: "50%",
              width: 64,
              height: 64,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              boxShadow: 6,
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={() => {
              // You can replace this with chat window open logic
              alert(`Open chat with ${activeAgentForWidget.name}`);
              // For demo, just close the widget after click
              setActiveAgentForWidget(null);
            }}
            title={`Chat with ${activeAgentForWidget.name}`}
            role="button"
            aria-label={`Chat with ${activeAgentForWidget.name}`}
          >
            💬
          </Box>
        )}
      </Box>
    </Box>
  );
}
