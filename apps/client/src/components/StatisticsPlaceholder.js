// src/components/StatisticsPlaceholder.js

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

function StatisticsPlaceholder() {
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 2, border: '1px solid grey', borderRadius: 2 }}>
      <Typography variant="h6">{t('statistics')}</Typography>
      <Typography variant="body1">{t('statisticsComingSoon')}</Typography>
    </Box>
  );
}

export default StatisticsPlaceholder;