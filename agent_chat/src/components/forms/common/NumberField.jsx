import React from 'react';
import { TextField } from '@mui/material';

export const NumberField = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  required = true,
  fullWidth = true,
  ...props
}) => (
  <TextField
    type="number"
    label={label}
    value={value}
    onChange={onChange}
    inputProps={{ 
      min,
      max,
      step,
    }}
    fullWidth={fullWidth}
    required={required}
    margin="normal"
    {...props}
  />
);
