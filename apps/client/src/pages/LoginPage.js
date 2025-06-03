// src/pages/LoginPage.js

import React, { useState, useContext } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signInWithPopup } from 'firebase/auth';
import GoogleIcon from '@mui/icons-material/Google';

// Firebase and social auth imports
import { auth, googleProvider } from '../firebase';

// Application services and contexts
import { AuthContext } from '../contexts/AuthContext';
import LanguageSelector from '../components/LanguageSelector'; // Dil seçici eklendi

function LoginPage() {
  const { t } = useTranslation();
  const { login: authLogin, googleLogin: authGoogleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const userData = await authLogin(email, password);
      // manage remember me credentials
      if (rememberMe) {
        localStorage.setItem('credentials', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('credentials');
      }
      navigate('/home');
    } catch (err) {
      console.error('Giriş hatası:', err);
      const msg = err.response?.data?.message;
      setError(msg || t('loginError') || 'Giriş başarısız.');
    }
  };

  // Google social login handler
  const handleGoogleSignIn = async () => {
    try {
      // authenticate via Firebase client SDK
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const userData = await authGoogleLogin(idToken);
      navigate('/home');
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(t('loginError') || 'Google giriş başarısız.');
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
      <Grow in timeout={700}>
        <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: '16px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', transition: 'transform .3s ease', '&:hover': { transform: 'scale(1.02)' } }}>
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
            <Box display="flex" justifyContent="center" my={2}>
              <Button
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                fullWidth
                sx={{ textTransform: 'none' }}
              >
                {t('loginWithGoogle')}
              </Button>
            </Box>
          </form>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              component={RouterLink}
              to="/forgot-password"
              variant="text"
              color="primary"
              size="small"
            >
              {t('forgotPassword')}
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="text"
              color="primary"
              size="small"
            >
              {t('register')}
            </Button>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
}

export default LoginPage;