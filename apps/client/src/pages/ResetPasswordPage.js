import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../services/authService';

function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const oobCode = params.get('oobCode');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!oobCode) {
      setError(t('resetPassword.missingCode', 'Geçersiz veya eksik sıfırlama kodu.'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('resetPassword.passwordMismatch', 'Parolalar eşleşmiyor.'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(undefined, oobCode, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || t('resetPassword.failed', 'Şifre sıfırlama başarısız.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            {t('resetPassword.success', 'Şifreniz başarıyla güncellendi.')}
          </Typography>
          <Button fullWidth variant="contained" onClick={() => navigate('/login')}>
            {t('resetPassword.toLogin', 'Giriş Sayfasına Git')}
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          {t('resetPassword.title', 'Şifre Sıfırlama')}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label={t('newPassword', 'Yeni Parola')}
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <TextField
            label={t('confirmPassword', 'Parolayı Onayla')}
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} startIcon={loading && <CircularProgress size={20} />}>
            {t('resetPassword.submit', 'Şifreyi Güncelle')}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default ResetPasswordPage; 