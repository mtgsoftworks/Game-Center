import React from 'react';
import { Typography, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';

function StatisticsPage() {
  const { t } = useTranslation();

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('statistics')}
      </Typography>
      <Typography variant="body1">
        {t('statisticsPageContentPlaceholder', 'Kullanıcı ve oyun istatistiklerinin gösterileceği sayfa. Yakında burada olacak!')}
      </Typography>
    </Container>
  );
}

export default StatisticsPage; 