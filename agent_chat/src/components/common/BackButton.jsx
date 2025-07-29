import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const BackButton = ({ label = 'Back', ...props }) => {
  const navigate = useNavigate();
  
  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate(-1)}
      sx={{ mb: 2 }}
      {...props}
    >
      {label}
    </Button>
  );
};

export default BackButton;
