// src/components/LanguageSelector.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box } from '@mui/material';

function LanguageSelector() {
  const { i18n } = useTranslation(); // Doğru kullanım

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Şimdi i18n.changeLanguage fonksiyonu mevcut
  };

  return (
    <Box display="flex" justifyContent="center" mt={2}>
      <Button onClick={() => changeLanguage('tr')}>Türkçe</Button>
      <Button onClick={() => changeLanguage('en')}>English</Button>
    </Box>
  );
}

export default LanguageSelector;