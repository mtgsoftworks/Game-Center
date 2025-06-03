/**
 * src/components/LanguageSelector.js: Dil değiştirme bileşeni.
 * i18next kullanarak uygulamanın dilini Türkçe veya İngilizce olarak değiştirir.
 * Butonlarla dil seçimi sağlar.
 *
 * @returns {JSX.Element} Dil seçici bileşeni.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box } from '@mui/material';

function LanguageSelector() {
  const { i18n } = useTranslation(); // Doğru kullanım

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Şimdi i18n.changeLanguage fonksiyonu mevcut
    localStorage.setItem('locale', lng); // localStorage'ı güncelle
  };

  return (
    <Box display="flex" justifyContent="center" mt={2}>
      <Button onClick={() => changeLanguage('tr')}>Türkçe</Button>
      <Button onClick={() => changeLanguage('en')}>English</Button>
    </Box>
  );
}

export default LanguageSelector;