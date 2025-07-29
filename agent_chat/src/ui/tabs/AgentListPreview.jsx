import * as React from "react";
import {
  Box,
  Grid,
  Card,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Avatar,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useQuery } from "@tanstack/react-query";
import { listAgent } from "../../api/agentApi";

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
      px: 0, // remove horizontal padding to allow full-width background
      bgcolor: "#f8fafd",
      minHeight: "100vh",
    }}
  >
    <Box
      sx={{
        maxWidth: 1200, // limit content width for readability
        mx: "auto", // center horizontally
        px: { xs: 2, sm: 3, md: 6 }, // inner padding
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        mb={4}
        color="text.primary" // ensure visible text
      >
        Agents
      </Typography>

      {isLoading ? (
        <Box textAlign="center" mt={8}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ my: 4 }}>
          Unable to load agents.
        </Alert>
      ) : (
        agentsChunks.map((chunk, idx) => (
          <Grid
            container
            spacing={4}
            key={`row-${idx}`}
            sx={{ mb: 2 }}
          >
            {chunk.map((agent) => (
              <Grid
                item
                xs={12}
                sm={4}
                key={agent._id}
                sx={{ width: "100%" }} // full width to grid item
              >
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
                    width: "100%", // full width of grid item
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      zIndex: 1,
                      bgcolor: "background.paper",
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Box
                    sx={{ display: "flex", alignItems: "center", mt: 1, gap: 2 }}
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
        ))
      )}
    </Box>
  </Box>
);

}
