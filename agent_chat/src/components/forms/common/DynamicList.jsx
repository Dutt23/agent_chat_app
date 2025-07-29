import React from 'react';
import { TextField, IconButton, Grid, Typography, Box, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

export const DynamicList = ({
  items,
  onAdd,
  onRemove,
  onChange,
  label,
  placeholder = '',
  minItems = 1,
  renderItem = (item, index, handleChange) => (
    <TextField
      value={item}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      fullWidth
      size="small"
      required={index === 0}
    />
  ),
}) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle1" sx={{ mb: 1 }}>
      {label}
    </Typography>
    {items.map((item, idx) => (
      <Grid container spacing={1} alignItems="center" key={idx} sx={{ mb: 1 }}>
        <Grid item xs={10}>
          {renderItem(item, idx, (value) => onChange(idx, value))}
        </Grid>
        <Grid item xs={2}>
          <IconButton
            onClick={() => onRemove(idx)}
            disabled={items.length <= minItems}
            color="error"
            size="large"
          >
            <RemoveCircleIcon />
          </IconButton>
        </Grid>
      </Grid>
    ))}
    <Button
      variant="outlined"
      startIcon={<AddCircleIcon />}
      onClick={onAdd}
      sx={{ mt: 1 }}
    >
      Add {label}
    </Button>
  </Box>
);
