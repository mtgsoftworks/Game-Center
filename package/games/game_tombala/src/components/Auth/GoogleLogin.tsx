import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { Button, Container, Typography, Box, CircularProgress } from '@mui/material';
import { auth, googleProvider } from '../../services/firebase'; // Import Firebase services
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth hook
import { useTranslation } from 'react-i18next';

const GoogleLogin: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Redirect to lobby if user is already logged in and not loading
    if (!loading && currentUser) {
      navigate('/lobby');
    }
  }, [currentUser, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Successful sign-in will trigger onAuthStateChanged in AuthContext
      // and the useEffect above will handle the redirect.
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      // TODO: Show user-friendly error message (e.g., using a snackbar/toast)
    }
  };

  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <Container maxWidth="xs">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // If user is not logged in, show the login button
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
            startIcon={<span> G </span>} // Basic Google Icon placeholder
          >
            {t('signInGoogle')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default GoogleLogin; 