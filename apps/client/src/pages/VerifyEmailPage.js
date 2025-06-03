// src/pages/VerifyEmailPage.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {t('email_verification')}
      </Typography>
      <Alert severity="info">
        {t('verifyEmailInfo')}
      </Alert>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => navigate('/')}
      >
        {t('backToHome')}
      </Button>
    </Container>
  );
}

export default VerifyEmailPage;