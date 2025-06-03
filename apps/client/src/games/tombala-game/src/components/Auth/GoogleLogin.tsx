/**
 * src/components/Auth/GoogleLogin.tsx: Google ile giriş işlemini yöneten bileşen.
 * Firebase Auth kullanarak kullanıcıyı Google hesabı ile kimlik doğrulamasına yönlendirir.
 * Başarılı girişte kullanıcıyı yönlendirir, hata durumunda bilgilendirme sağlar.
 * Çoklu dil desteği içerir.
 *
 * @returns {JSX.Element} Google ile giriş butonu ve işlem sonucu.
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { Button, Container, Typography, Box, CircularProgress } from '@mui/material';
import { auth, googleProvider } from '../../services/firebase'; // Firebase servislerini içe aktar
import { useAuth } from '../../contexts/AuthContext'; // useAuth hook'unu içe aktar
import { useTranslation } from 'react-i18next';

const GoogleLogin: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Kullanıcı girişli ve yüklenme tamamlandıysa lobye yönlendir
    if (!loading && currentUser) {
      navigate('/lobby');
    }
  }, [currentUser, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Başarılı giriş, AuthContext içindeki onAuthStateChanged tetikler
      // ve yukarıdaki useEffect yönlendirmeyi gerçekleştirir.
    } catch (error) {
      console.error("Google Giriş Hatası:", error);
      // TODO: Kullanıcıya dostane hata mesajı göster (ör. snackbar/toast)
    }
  };

  // Yüklenme durumunda gösterilecek yükleme göstergesi
  if (loading) {
    return (
      <Container maxWidth="xs">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Kullanıcı girişli değilse giriş butonunu göster
  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          {t('loginTitle')}
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleGoogleSignIn}
            fullWidth
            startIcon={<span> G </span>} // Basit Google ikon yer tutucu
          >
            {t('signInGoogle')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default GoogleLogin; 