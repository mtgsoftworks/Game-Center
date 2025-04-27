import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Switch, FormControlLabel, FormControl, InputLabel, Select, MenuItem, Button, Box, Snackbar, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useContext(AppContext);
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('soundEnabled') !== 'false');
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('notificationsEnabled') !== 'false');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const darkMode = state.themeMode === 'game';

  const handleDarkMode = (event) => dispatch({ type: 'SET_THEME_MODE', payload: event.target.checked ? 'game' : 'ui' });
  const handleLanguage = (event) => {
    dispatch({ type: 'SET_LOCALE', payload: event.target.value });
    i18n.changeLanguage(event.target.value);
  };
  const handleSound = (event) => setSoundEnabled(event.target.checked);
  const handleNotifications = (event) => setNotificationsEnabled(event.target.checked);
  const handleSave = () => {
    localStorage.setItem('soundEnabled', soundEnabled);
    localStorage.setItem('notificationsEnabled', notificationsEnabled);
    setOpenSnackbar(true);
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
      <FormControl fullWidth margin="normal">
        <InputLabel id="language-label">{t('language')}</InputLabel>
        <Select
          labelId="language-label"
          value={state.locale}
          label={t('language')}
          onChange={handleLanguage}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="tr">Türkçe</MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel
        control={<Switch checked={soundEnabled} onChange={handleSound} />}
        label={t('sound')}
      />
      <FormControlLabel
        control={<Switch checked={notificationsEnabled} onChange={handleNotifications} />}
        label={t('notifications')}
      />
      <Box mt={4} textAlign="center">
        <Button variant="contained" color="primary" onClick={handleSave}>{t('saveSettings')}</Button>
      </Box>
      <Box mt={2} textAlign="center">
        <Button variant="outlined" onClick={() => navigate('/')}>{t('backToHome')}</Button>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {t('settingsSaved')}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SettingsPage;
