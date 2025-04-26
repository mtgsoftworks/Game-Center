// src/pages/ForgotPasswordPage.js

import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Avatar,
} from '@mui/material';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';
import LockResetIcon from '@mui/icons-material/LockReset';
import { sendResetCode, resetPassword } from '../services/authService';

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (value) => {
    // Basit bir e-posta doğrulama regex'i
    const re = /\S+@\S+\.\S+/;
    return re.test(value);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailError('');

    if (!email) {
      setEmailError('E-posta adresi gereklidir.');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Geçerli bir e-posta adresi giriniz.');
      setLoading(false);
      return;
    }

    if (!captchaValue) {
      setError('Lütfen CAPTCHA doğrulamasını tamamlayın.');
      setLoading(false);
      return;
    }

    try {
      await sendResetCode(email, captchaValue); // Token'ı gönderiyoruz
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!resetCode) {
      setError('Doğrulama kodu gereklidir.');
      setLoading(false);
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Şifre ve şifre tekrarı gereklidir.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(email, resetCode, newPassword, confirmPassword);
      // Redirect to login after reset
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={6} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><LockResetIcon /></Avatar>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {step === 1 ? 'Şifremi Unuttum' : 'Şifreyi Sıfırla'}
          </Typography>
        </Box>
        {step === 1 && (
          <>
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleEmailSubmit}>
              <TextField
                label="E-posta"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(emailError)}
                helperText={emailError}
              />
              <ReCAPTCHA
                sitekey="6LdWer0qAAAAAPXXTthNAWq6zx0Nqhd__XwGO3q0" // Kendi site anahtarınızla değiştirin
                onChange={(value) => setCaptchaValue(value)}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
                fullWidth
                style={{ marginTop: '16px' }}
              >
                {loading ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
              </Button>
            </form>
          </>
        )}
        {step === 2 && (
          <>
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleResetSubmit}>
              <TextField
                label="Doğrulama Kodu"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
              />
              <TextField
                label="Yeni Şifre"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <TextField
                label="Yeni Şifre (Tekrar)"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
                fullWidth
                style={{ marginTop: '16px' }}
              >
                {loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
              </Button>
            </form>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default ForgotPasswordPage;