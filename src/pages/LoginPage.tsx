import React from 'react';
import { Box } from '@mui/material';
import { Login } from '../components/Auth/Login';

const LoginPage: React.FC = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'grey.50'
    }}>
      <Login />
    </Box>
  );
};

export default LoginPage;
