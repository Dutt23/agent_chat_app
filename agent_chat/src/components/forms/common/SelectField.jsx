import React from 'react';
import { TextField, MenuItem } from '@mui/material';

export const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  required = true,
  fullWidth = true,
  ...props
}) => (
  <TextField
    select
    label={label}
    value={value}
    onChange={onChange}
    fullWidth={fullWidth}
    required={required}
    disabled={disabled}
    margin="normal"
    {...props}
  >
    {options.map((option) => (
      <MenuItem key={option.id} value={option.id}>
        {option.label || option.display || option.id}
      </MenuItem>
    ))}
  </TextField>
);
