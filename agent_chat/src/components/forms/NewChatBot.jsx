import React, { useEffect, useState } from "react";
import {
  Container, Box, TextField, MenuItem, Button, Typography, IconButton, Grid, Paper
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import providersData from "../../data/providers_and_models.json";
import credentialsData from "../../data/credentials.json";

export default function AgentCreationForm({ onSubmit }) {
  // State
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState([
    { type: "", config: "{}", priority: 0 }
  ]);
  const [tools, setTools] = useState([""]);
  const [llmCredentialId, setLlmCredentialId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [model, setModel] = useState("");
  const [topP, setTopP] = useState(0.95);
  const [temperature, setTemperature] = useState(0.7);
  const [responseFormat, setResponseFormat] = useState("{}");

  // Options
  const [providerOptions, setProviderOptions] = useState([]);
  const [credentialOptions, setCredentialOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);

  // Loads mock/static data
  useEffect(() => {
    setProviderOptions(providersData);
    setCredentialOptions(credentialsData);
  }, []);

  // Update model options when provider changes
  useEffect(() => {
    const found = providerOptions.find((p) => p.id === providerId);
    setModelOptions(found?.models || []);
    setModel(""); // Reset if provider switches
  }, [providerId, providerOptions]);

  // Features
  const handleFeatureChange = (idx, field, value) => {
    setFeatures(features.map((f, i) =>
      i === idx ? { ...f, [field]: value } : f
    ));
  };
  const addFeature = () =>
    setFeatures([...features, { type: "", config: "{}", priority: 0 }]);
  const removeFeature = (idx) =>
    setFeatures(features.filter((_, i) => i !== idx));

  // Tools
  const handleToolChange = (idx, value) => {
    setTools(tools.map((t, i) => (i === idx ? value : t)));
  };
  const addTool = () => setTools([...tools, ""]);
  const removeTool = (idx) => setTools(tools.filter((_, i) => i !== idx));

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // Defensive parse for config and response_format
    const safeJsonParse = (txt) => {
      try {
        return JSON.parse(txt || "{}");
      } catch {
        return {};
      }
    };
    const payload = {
      name: name,
      system_prompt: systemPrompt,
      description: description,
      features: features.map((f) => ({
        type: f.type,
        config: safeJsonParse(f.config),
        priority: Number(f.priority)
      })),
      tools: tools.filter(Boolean),
      llm_credential_id: llmCredentialId,
      provider_id: providerId,
      model: model,
      top_p: Number(topP),
      temperature: Number(temperature),
      response_format: safeJsonParse(responseFormat)
    };
    if (onSubmit) onSubmit(payload);
  };

  return (
    <Container maxWidth="md">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 6, mb: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Create a Lyzr Agent
          </Typography>
          <TextField
            label="Agent Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth margin="normal" required
          />
          <TextField
            label="System Prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            multiline rows={2}
            fullWidth margin="normal" required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline rows={2}
            fullWidth margin="normal" required
          />

          {/* Features */}
          <Typography sx={{ mt: 3 }}>Features</Typography>
          {features.map((f, idx) => (
            <Grid container spacing={1} alignItems="center" key={idx} sx={{ mb: 1 }}>
              <Grid item xs={3}>
                <TextField
                  label="Type"
                  value={f.type}
                  onChange={e => handleFeatureChange(idx, "type", e.target.value)}
                  size="small" required
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="Config (JSON)"
                  value={f.config}
                  onChange={e => handleFeatureChange(idx, "config", e.target.value)}
                  size="small" fullWidth
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Priority"
                  type="number"
                  value={f.priority}
                  onChange={e => handleFeatureChange(idx, "priority", e.target.value)}
                  size="small" required
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  onClick={() => removeFeature(idx)}
                  disabled={features.length === 1}
                  color="error"
                  size="large"
                ><RemoveCircleIcon /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddCircleIcon />}
            onClick={addFeature}
            sx={{ mb: 2 }}
          >
            Add Feature
          </Button>

          {/* Tools */}
          <Typography sx={{ mt: 3 }}>Tools</Typography>
          {tools.map((tool, idx) => (
            <Grid container spacing={1} alignItems="center" key={idx} sx={{ mb: 1 }}>
              <Grid item xs={10}>
                <TextField
                  label="Tool"
                  value={tool}
                  onChange={(e) => handleToolChange(idx, e.target.value)}
                  size="small"
                  fullWidth required={idx === 0}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  onClick={() => removeTool(idx)}
                  disabled={tools.length === 1}
                  color="error" size="large"
                ><RemoveCircleIcon /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddCircleIcon />}
            onClick={addTool}
            sx={{ mb: 2 }}
          >
            Add Tool
          </Button>

          {/* Credentials */}
          <TextField
            select label="LLM Credential"
            value={llmCredentialId}
            onChange={e => setLlmCredentialId(e.target.value)}
            fullWidth required margin="normal"
          >
            {credentialOptions
              .filter(c => !providerId || c.provider === providerId)
              .map(option => (
                <MenuItem key={option.id} value={option.id}>{option.display}</MenuItem>
              ))}
          </TextField>

          {/* Provider */}
          <TextField
            select label="Provider"
            value={providerId}
            onChange={e => setProviderId(e.target.value)}
            fullWidth required margin="normal"
          >
            {providerOptions.map(option => (
              <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
            ))}
          </TextField>

          {/* Model */}
          <TextField
            select label="Model"
            value={model}
            onChange={e => setModel(e.target.value)}
            fullWidth required margin="normal" disabled={!providerId}
          >
            {modelOptions.map(option => (
              <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
            ))}
          </TextField>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Top P"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 1 }}
                value={topP}
                onChange={e => setTopP(e.target.value)}
                fullWidth required margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Temperature"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 2 }}
                value={temperature}
                onChange={e => setTemperature(e.target.value)}
                fullWidth required margin="normal"
              />
            </Grid>
          </Grid>
          <TextField
            label="Response Format (JSON)"
            value={responseFormat}
            onChange={e => setResponseFormat(e.target.value)}
            multiline rows={2} fullWidth required margin="normal"
            placeholder="{}"
          />

          <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 3 }}>
            Create Agent
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
