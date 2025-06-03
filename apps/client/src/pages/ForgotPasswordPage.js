/**
 * src/pages/ForgotPasswordPage.js: Şifremi unuttum sayfası bileşeni.
 * Kullanıcı e-posta adresini girerek şifre sıfırlama bağlantısı talep edebilir.
 *
 * @returns {JSX.Element} Şifre sıfırlama formunu içeren sayfa.
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Avatar,
  Grow,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockResetIcon from '@mui/icons-material/LockReset';
import { sendResetCode } from '../services/authService';

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (value) => {
    // Basit bir e-posta doğrulama regex'i
    const re = /\S+@\S+\.\S+/;
    return re.test(value);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    console.log('Forgot password payload:', { email });
    setLoading(true);
    setError('');
    setEmailError('');

    if (!email) {
      setEmailError(t('emailRequired'));
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t('invalidEmail'));
      setLoading(false);
      return;
    }

    try {
      await sendResetCode(email); // Token'ı gönderiyoruz
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Grow in timeout={700}>
        <Paper elevation={6} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><LockResetIcon /></Avatar>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {t('forgotPassword')}
            </Typography>
          </Box>
          {!success ? (
            <>
              {error && <Alert severity="error">{error}</Alert>}
              <form onSubmit={handleEmailSubmit}>
                <TextField
                  label={t('email')}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={Boolean(emailError)}
                  helperText={emailError}
                />
                {/* recaptcha removed */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                  fullWidth
                  style={{ marginTop: '16px' }}
                >
                  {loading ? t('sending') : t('sendResetLink')}
                </Button>
              </form>
            </>
          ) : (
            <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
              {t('resetEmailSent')}
            </Typography>
          )}
          <Box display="flex" justifyContent="center" mt={2}>
            <Button onClick={() => navigate('/')} color="primary">
              {t('backToHome')}
            </Button>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
}

export default ForgotPasswordPage;