// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import tr from './locales/tr/translation.json';
import en from './locales/en/translation.json';

// Read saved locale or default to Turkish
const savedLocale = localStorage.getItem('locale') || 'tr';

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: savedLocale, // Varsayılan dil from localStorage
  fallbackLng: 'en', // Çeviri bulunamadığında kullanılacak dil
  interpolation: { escapeValue: false },
  debug: true,
});

export default i18n;
