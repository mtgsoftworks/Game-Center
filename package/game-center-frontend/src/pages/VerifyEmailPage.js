// src/pages/VerifyEmailPage.js

import React from 'react';
import { Container, Typography, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function VerifyEmailPage() {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        E-posta Doğrulama
      </Typography>
      <Alert severity="info">
        Lütfen e-posta adresinize gelen linke tıklayarak hesabınızı doğrulayın.
      </Alert>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => navigate('/')}
      >
        Ana ekrana dön
      </Button>
    </Container>
  );
}

export default VerifyEmailPage;