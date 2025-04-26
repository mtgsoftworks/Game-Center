// src/pages/VerifyEmailPage.js

import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyEmail } from '../services/authService';

function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    // Eğer email bilgisi yoksa kayıt sayfasına yönlendir
    navigate('/register');
  }

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      await verifyEmail(email, verificationCode);
      setSuccess('E-posta doğrulama başarılı. Kayıt tamamlandı.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Doğrulama sırasında bir hata oluştu.');
    }
  };

  return (
    <Container maxWidth="sm">
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Typography variant="h5" gutterBottom>
        E-posta Doğrulama
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography gutterBottom>
        E-posta adresinize gönderilen 6 haneli doğrulama kodunu giriniz.
      </Typography>
      <form onSubmit={handleVerify}>
        <TextField
          label="Doğrulama Kodu"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Doğrula
        </Button>
      </form>
    </Container>
  );
}

export default VerifyEmailPage;