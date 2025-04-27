// src/pages/ProfilePage.js

import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth'; // Kullanıcının kullandığı varsayılan auth hook'u
import AchievementsPlaceholder from '../components/AchievementsPlaceholder';
import StatisticsPlaceholder from '../components/StatisticsPlaceholder';

function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuth();

  if (!user) {
    return null; // useAuth içinde zaten yönlendirme yapılır
  }

  const handleEditProfile = () => {
    // TODO: Implement edit profile modal
    console.info('Edit profile not implemented');
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" mt={5}>
        {t('myProfile')}
      </Typography>
      <Box mt={3}>
        <Typography variant="h6">
          {t('name')}: {user.name}
        </Typography>
        <Typography variant="h6">
          {t('email')}: {user.email}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleEditProfile}
        sx={{ mt: 2 }}
      >
        {t('editProfile')}
      </Button>

      {/* Başarımlar ve İstatistikler Bölümü */}
      <Box mt={4}>
        <AchievementsPlaceholder />
      </Box>
      <Box mt={4}>
        <StatisticsPlaceholder />
      </Box>
    </Container>
  );
}

export default ProfilePage;