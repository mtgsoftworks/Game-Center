/**
 * src/i18n.ts: Uygulama için çoklu dil desteğini başlatır ve yapılandırır.
 * Backend, LanguageDetector ve React-i18next entegrasyonunu içerir.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Backend: çeviri dosyalarını /public/locales klasöründen yükler
  .use(Backend)
  // LanguageDetector: kullanıcının tarayıcı veya localStorage dil tercihini algılar
  .use(LanguageDetector)
  // initReactI18next: i18n örneğini React ile entegre eder
  .use(initReactI18next)
  // Initialize i18n
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'tr'],
    debug: true,
    interpolation: {
      escapeValue: false, // React zaten kaçış işlemi yapar
    },
    detection: {
      // Algılama önceliği
      order: ['localStorage', 'navigator'],
      // LocalStorage'da dil tercihini sakla
      caches: ['localStorage'],
    },
    backend: {
      // Çeviri dosyalarının yolu
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;