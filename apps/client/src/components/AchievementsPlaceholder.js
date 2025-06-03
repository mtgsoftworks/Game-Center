/**
 * src/components/AchievementsPlaceholder.js: Başarı göstergeleri bölümünün yüklenme placeholder bileşeni.
 * Bu bileşen, başarılar yüklenirken kullanıcıya görsel bir placeholder sunar.
 *
 * @returns {JSX.Element} Yüklenme placeholder bileşeni.
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

function AchievementsPlaceholder() {
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 2, border: '1px solid grey', borderRadius: 2 }}>
      <Typography variant="h6">{t('achievements')}</Typography>
      <Typography variant="body1">{t('achievementsComingSoon')}</Typography>
    </Box>
  );
}

export default AchievementsPlaceholder;