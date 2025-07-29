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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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

// Add this new component for the agent menu
function AgentMenu({ agentId }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleEdit = (event) => {
    handleClose(event);
    console.log('Edit agent:', agentId);
    // Add your edit logic here
  };

  const handleDelete = (event) => {
    handleClose(event);
    console.log('Delete agent:', agentId);
    // Add your delete logic here
  };

  const handleDuplicate = (event) => {
    handleClose(event);
    console.log('Duplicate agent:', agentId);
    // Add your duplicate logic here
  };

  return (
    <div>
      <IconButton
        size="small"
        onClick={handleClick}
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
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error.main' }}>
            Delete
          </ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
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
        <Typography
          variant="h4"
          fontWeight={700}
          mb={4}
          color="text.primary"
        >
          Agents
        </Typography>

        {agentsChunks.map((chunk, idx) => (
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
                sx={{ width: "100%" }}
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
                    width: "100%",
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <AgentMenu agentId={agent._id} />
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
        ))}
      </Box>
    </Box>
  );
}
