// src/pages/LoginPage.js

import React, { useState, useContext, useEffect } from 'react';
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Paper,
  Alert,
  Grow,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Proje içi importlar
import { login } from '../services/authService';
import { UserContext } from '../contexts/UserContext';
import LanguageSelector from '../components/LanguageSelector'; // Dil seçici eklendi

function LoginPage() {
  const { t } = useTranslation();
  const { setUser } = useContext(UserContext);
  // Prefill credentials if saved
  useEffect(() => {
    const stored = localStorage.getItem('credentials');
    if (stored) {
      try {
        const { email: e, password: p } = JSON.parse(stored);
        setEmail(e);
        setPassword(p);
        setRememberMe(true);
      } catch (err) {
        console.error('Error parsing stored credentials', err);
      }
    }
  }, []);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const userData = await login(email, password);
      setUser(userData);
      // store token
      localStorage.setItem('user', JSON.stringify(userData));
      // manage remember me credentials
      if (rememberMe) {
        localStorage.setItem('credentials', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('credentials');
      }
      navigate('/');
    } catch (err) {
      console.error('Giriş hatası:', err);
      const msg = err.response?.data?.message;
      setError(msg || t('loginError') || 'Giriş başarısız.');
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" sx={{ background: 'linear-gradient(135deg, #ece9e6, #ffffff)' }}>
      <Grow in timeout={700}>
        <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 2, transition: 'transform .3s ease', '&:hover': { transform: 'scale(1.02)' } }}>
          <LanguageSelector />
          <Box display="flex" justifyContent="center" mb={2}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{t('login')}</Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField
              label={t('email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label={t('password')}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
              }
              label={t('rememberMe')}
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {t('login')}
            </Button>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button component={RouterLink} to="/forgot-password" size="small">{t('forgotPassword')}</Button>
              <Button component={RouterLink} to="/register" size="small">{t('register')}</Button>
            </Box>
          </form>
        </Paper>
      </Grow>
    </Box>
  );
}

export default LoginPage;