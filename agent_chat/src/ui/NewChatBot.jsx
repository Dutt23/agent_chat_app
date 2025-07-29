import React, { useEffect, useState } from "react";
import {
  Container, Box, TextField, Button, Typography, Paper, Grid
} from "@mui/material";
import { SelectField, NumberField, DynamicList } from "../components/forms/common";
import { BackButton } from "../components/common";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import providersData from "../data/providers_and_models.json";
import credentialsData from "../data/credentials.json";
import { useMutation } from "@tanstack/react-query";
import { createAgent, parseFeatureConfig, parseResponseFormat } from "../api/agentApi";
import CreateCredentialsModal from "./modals/CreateCredentialsModal";

export default function AgentCreationForm() {
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

  // State for credentials modal
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [lyzrApiKey, setLyzrApiKey] = useState(""); // You'll need to set this from your auth context or props

  const mutation = useMutation({
    mutationFn: createAgent,
    onSuccess: data => {
      alert("Agent created! " + (data.id || JSON.stringify(data)));
    },
    onError: error => {
      alert("Creation failed: " + error.message);
    },
  });

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

  // Add this function to refresh credentials after a new one is created
  const handleCredentialCreated = () => {
    // You might want to add logic here to refresh the credentials list
    // For example, if you fetch credentials from an API
    console.log("New credential created, refresh credentials list here");
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // Defensive parse for config and response_format
    const parsedFeatures = features.map(f => ({
      type: f.type,
      config: parseFeatureConfig(f.config), // config str to object
      priority: Number(f.priority),
    }));

    const parsedResponseFormat = parseResponseFormat(responseFormat);
    const payload = {
      name,
      system_prompt: systemPrompt,
      description,
      features: parsedFeatures,
      tools,
      llm_credential_id: llmCredentialId,
      provider_id: providerId,
      model,
      top_p: Number(topP),
      temperature: Number(temperature),
      response_format: parsedResponseFormat,
    };
    mutation.mutate(payload);
  };

  return (
    <Container maxWidth="md">
      <BackButton />
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Create a Lyzr Agent
          </Typography>
          
          <Button 
            variant="outlined" 
            onClick={() => setIsCredentialModalOpen(true)}
            sx={{ mb: 3 }}
            startIcon={<AddCircleIcon />}
          >
            Add New Credentials
          </Button>

          <TextField
            fullWidth
            label="Agent Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="System Prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />

          {/* Features Section */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Features</Typography>
          {features.map((feature, idx) => (
            <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Feature Type"
                    value={feature.type}
                    onChange={(e) => handleFeatureChange(idx, 'type', e.target.value)}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <NumberField
                    label="Priority"
                    value={feature.priority}
                    onChange={(e) => handleFeatureChange(idx, 'priority', e.target.value)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Config (JSON)"
                    value={feature.config}
                    onChange={(e) => handleFeatureChange(idx, 'config', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<RemoveCircleIcon />}
                    onClick={() => removeFeature(idx)}
                    disabled={features.length <= 1}
                  >
                    Remove Feature
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddCircleIcon />}
            onClick={addFeature}
            sx={{ mt: 1, mb: 3 }}
          >
            Add Feature
          </Button>

          {/* Tools Section */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Tools</Typography>
          <DynamicList
            items={tools}
            onAdd={addTool}
            onRemove={removeTool}
            onChange={handleToolChange}
            label="Tools"
            placeholder="Enter tool name"
          />

          {/* LLM Configuration */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>LLM Configuration</Typography>
          <SelectField
            label="Provider"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            options={providerOptions}
          />
          
          <SelectField
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            options={modelOptions}
            disabled={!providerId}
          />
          
          <SelectField
            label="LLM Credential"
            value={llmCredentialId}
            onChange={(e) => setLlmCredentialId(e.target.value)}
            options={credentialOptions.filter(c => !providerId || c.provider === providerId)}
          />
          
          <NumberField
            label="Top P"
            value={topP}
            onChange={(e) => setTopP(e.target.value)}
            min={0}
            max={1}
            step={0.01}
          />
          
          <NumberField
            label="Temperature"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            min={0}
            max={2}
            step={0.1}
          />
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Response Format (JSON)"
            value={responseFormat}
            onChange={(e) => setResponseFormat(e.target.value)}
            margin="normal"
          />

          <CreateCredentialsModal 
            open={isCredentialModalOpen}
            onClose={() => setIsCredentialModalOpen(false)}
            lyzrApiKey={lyzrApiKey}
            onSuccess={handleCredentialCreated}
          />

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary" size="large">
              Create Agent
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
