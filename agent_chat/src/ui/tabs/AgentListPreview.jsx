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
import { listAgent } from "../../api/agentApi"; // Your API function

// Utility to split array into chunks
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

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

export function AgentListPage() {
  const { data: agents, isLoading, isError } = useQuery({
    queryKey: ["agents"],
    queryFn: listAgent,
  });

  const agentsChunks = agents ? chunkArray(agents, 3) : [];

  const [activeAgentForWidget, setActiveAgentForWidget] = React.useState(null);

  // Widget position (start near bottom-right with some margin)
  const [widgetPos, setWidgetPos] = React.useState({
    x: window.innerWidth - 96,
    y: window.innerHeight - 96,
  });

  // Drag state
  const [dragging, setDragging] = React.useState(false);
  const dragOffset = React.useRef({ x: 0, y: 0 });

  // Function to constrain position within viewport (64x64 widget size)
  const constrainPosition = React.useCallback(({ x, y }) => {
    const minX = 0;
    const minY = 0;
    const maxX = window.innerWidth - 64;
    const maxY = window.innerHeight - 64;
    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  }, []);

  // Mouse / touch down handler: start dragging
  const startDrag = React.useCallback((clientX, clientY) => {
    setDragging(true);
    dragOffset.current = {
      x: clientX - widgetPos.x,
      y: clientY - widgetPos.y,
    };
  }, [widgetPos]);

  // Mouse down
  const handleMouseDown = (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };

  // Touch start
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    startDrag(touch.clientX, touch.clientY);
  };

  // Mouse / touch move handler
  const handleMove = React.useCallback(
    (clientX, clientY) => {
      if (!dragging) return;
      const newPos = {
        x: clientX - dragOffset.current.x,
        y: clientY - dragOffset.current.y,
      };
      setWidgetPos(constrainPosition(newPos));
    },
    [dragging, constrainPosition]
  );

  // Mouse move
  const onMouseMove = React.useCallback(
    (e) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  // Touch move
  const onTouchMove = React.useCallback(
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  // End dragging handler (mouse up or touch end)
  const endDrag = React.useCallback(() => {
    setDragging(false);
  }, []);

  // Setup & cleanup global listeners while dragging
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", endDrag);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", endDrag);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", endDrag);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", endDrag);
      };
    }
  }, [dragging, onMouseMove, onTouchMove, endDrag]);

  const handleEdit = (agentId, event) => {
    console.log("Edit agent:", agentId);
  };

  const handleDelete = (agentId, event) => {
    console.log("Delete agent:", agentId);
  };

  const handleDuplicate = (agentId, event) => {
    console.log("Duplicate agent:", agentId);
  };

  // Show the chat widget
  const handleShowWidget = (agent) => {
    setActiveAgentForWidget(agent);

    // Reset widget position to bottom-right on new agent chat open (optional)
    setWidgetPos({ x: window.innerWidth - 96, y: window.innerHeight - 96 });
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
                    onShowWidget={handleShowWidget}
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

        {/* Draggable Floating Chat Widget */}
        {activeAgentForWidget && (
          <Box
            sx={{
              position: "fixed",
              left: widgetPos.x,
              top: widgetPos.y,
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
              cursor: dragging ? "grabbing" : "grab",
              userSelect: "none",
              touchAction: "none", // important for preventing scroll on touch devices during drag
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            title={`Chat with ${activeAgentForWidget.name}`}
            role="button"
            aria-label={`Chat with ${activeAgentForWidget.name}`}
            onClick={() => {
              alert(`Open chat with ${activeAgentForWidget.name}`);
            }}
          >
            💬
          </Box>
        )}
      </Box>
    </Box>
  );
}
