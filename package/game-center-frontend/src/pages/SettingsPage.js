import React from 'react';
import { Container, Typography, Switch, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';

function SettingsPage() {
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = React.useState(false);

  const handleDarkMode = (event) => {
    setDarkMode(event.target.checked);
    // TODO: implement theme toggle functionality
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {t('settings')}
      </Typography>
      <FormControlLabel
        control={<Switch checked={darkMode} onChange={handleDarkMode} />}
        label={t('darkMode')}
      />
      {/* Add more settings options here */}
    </Container>
  );
}

export default SettingsPage;
