// src/pages/RegisterPage.js

import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Avatar,
  Alert,
  Grow,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

import { register } from '../services/authService';

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // 'useNavigate' hook'u ile 'navigate' fonksiyonunu tanımlıyoruz

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [error, setError] = useState(''); // 'error' durumunu tanımlıyoruz

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Register payload:', { email, name });

    try {
      await register(email, password, name);
      // Kayıt başarılı, doğrulama sayfasına yönlendir
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      console.error('Kayıt hatası:', err);
      setError(
        err.response?.data?.message ||
        t('registration_failed_check_info') // Çeviri dosyalarınızda uygun mesajı ekleyin
      );
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
      <Grow in timeout={700}>
        <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: '16px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', transition: 'transform .3s ease', '&:hover': { transform: 'scale(1.02)' } }}>
          <LanguageSelector />
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{t('register')}</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label={t('name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              {t('register')}
            </Button>
          </form>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Typography variant="body2">
              {t('haveAccount')}{' '}
              <Button
                component={RouterLink}
                to="/login"
                variant="text"
                color="primary"
                size="small"
              >
                {t('login')}
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
}

export default RegisterPage;