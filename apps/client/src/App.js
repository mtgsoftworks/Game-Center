/**
 * src/App.js: Uygulamanın ana bileşeni.
 * MUI tema sağlayıcısı ile temayı uygular ve uygulama rotalarını render eder.
 */
/**
 * @returns {JSX.Element} Temel tema sağlayıcı ve rotaları içeren React bileşeni.
 */
import React from 'react';
import { CssBaseline } from '@mui/material';
import { SettingsProvider } from './contexts/SettingsContext';
import { NotificationProvider } from './components/NotificationSystem';
import AppRoutes from './routes';
import { AnimatePresence } from 'framer-motion';

/**
 * Uygulamanın ana bileşeni.
 * Tema moduna göre tema sağlayıcısını ve rotaları render eder.
 * 
 * @returns {JSX.Element} Temel tema sağlayıcı ve rotaları içeren React bileşeni.
 */
function App() {
  return (
    <SettingsProvider>
      <NotificationProvider>
        <CssBaseline />
        <AnimatePresence mode="wait">
          <AppRoutes />
        </AnimatePresence>
      </NotificationProvider>
    </SettingsProvider>
  );
}

export default App;