import * as React from "react";
import {
  Box,
  Grid,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Modal,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import AgentMenu from "../common/AgentMenu";
import ChatPage from "../ChatPage"; // Adjust path as required
import { listAgent } from "../../api/agentApi"; // Your API function

// Utility to split array into chunks (for grid layout)
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// Utility for getting initials of agent name
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
  const [chatOpen, setChatOpen] = React.useState(false);

  // Position of draggable floating widget (starts near bottom-right)
  const [widgetPos, setWidgetPos] = React.useState({
    x: window.innerWidth - 96,
    y: window.innerHeight - 96,
  });

  // Drag state and offset ref
  const [dragging, setDragging] = React.useState(false);
  const dragOffset = React.useRef({ x: 0, y: 0 });

  // Keep widget within viewport boundaries
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

  // Begin drag (mouse or touch)
  const startDrag = React.useCallback(
    (clientX, clientY) => {
      setDragging(true);
      dragOffset.current = {
        x: clientX - widgetPos.x,
        y: clientY - widgetPos.y,
      };
    },
    [widgetPos]
  );

  // Mouse down handler to start drag
  const handleMouseDown = (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };

  // Touch start handler to start drag
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    startDrag(touch.clientX, touch.clientY);
  };

  // Move handler updates widget position
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

  // Mouse move handler
  const onMouseMove = React.useCallback(
    (e) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  // Touch move handler
  const onTouchMove = React.useCallback(
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  // Stop dragging handlers (mouse up, touch end)
  const endDrag = React.useCallback(() => {
    setDragging(false);
  }, []);

  // Attach/detach global event listeners during dragging
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

  // Handler functions for Edit, Delete, Duplicate
  const handleEdit = (agentId) => {
    console.log("Edit agent:", agentId);
  };

  const handleDelete = (agentId) => {
    console.log("Delete agent:", agentId);
  };

  const handleDuplicate = (agentId) => {
    console.log("Duplicate agent:", agentId);
  };

  // Show chat widget icon on screen for chosen agent
  const handleShowWidget = (agent) => {
    setActiveAgentForWidget(agent);
    setChatOpen(false);
    // Reset position to bottom-right on new open (optional)
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
              touchAction: "none",
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            title={`Chat with ${activeAgentForWidget.name}`}
            role="button"
            aria-label={`Chat with ${activeAgentForWidget.name}`}
            onClick={() => setChatOpen(true)} // Open modal on click
          >
            💬
          </Box>
        )}

        {/* Chat Modal Overlay */}
        <Modal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          aria-labelledby="chat-modal-title"
          aria-describedby="chat-modal-description"
        >
          <Box
            sx={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95vw", sm: 600 },
              height: { xs: "90vh", sm: 600 },
              bgcolor: "background.paper",
              boxShadow: 24,
              borderRadius: 2,
              outline: "none",
              display: "flex",
              flexDirection: "column",
              p: 0, // Remove padding for full content
            }}
          >
            <ChatPage agent={activeAgentForWidget} />
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}
