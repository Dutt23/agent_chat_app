import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { createCredential } from "../../api/credentialsApi";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: 375,
  maxWidth: 450,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function CredentialModal({ open, onClose, lyzrApiKey }) {
  const [name, setName] = useState("");
  const [providerId, setProviderId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [metaData, setMetaData] = useState("{}");

  const mutation = useMutation({
    mutationFn: values => createCredential(values, lyzrApiKey),
    onSuccess: () => {
      setName(""); setProviderId(""); setApiKey(""); setMetaData("{}");
      onClose();
    },
    onError: error => {
      alert("Failed: " + error.message);
    }
  });

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="credential-modal-title">
      <Box sx={style}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography id="credential-modal-title" variant="h6" component="h2">
            Add LLM Credential
          </Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <form onSubmit={e => {
          e.preventDefault();
          mutation.mutate({
            name, provider_id: providerId, api_key: apiKey, meta_data: metaData,
          });
        }}>
          <TextField
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Provider ID (e.g. openai, anthropic)"
            value={providerId}
            onChange={e => setProviderId(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="API Key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            fullWidth
            required
            margin="normal"
            type="password"
          />
          <TextField
            label="Meta Data (optional, JSON)"
            value={metaData}
            onChange={e => setMetaData(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="{}"
            multiline
            minRows={2}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Box>
    </Modal>
  );
}
