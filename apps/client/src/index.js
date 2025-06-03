/**
 * src/index.js: Uygulamanın giriş noktası.
 * ReactDOM ile root elementine App bileşenini render eder.
 * UserProvider ve AppProvider context sağlayıcıları ile BrowserRouter içinde sarar.
 */

/* eslint-disable import/order */
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as ThemeContextProvider } from './contexts/ThemeContext';
import UserProvider from './contexts/UserContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppProvider } from './contexts/AppContext';
import { I18nextProvider } from 'react-i18next'; 
import i18n from './i18n'; 
import App from './App';
// import './i18n'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <I18nextProvider i18n={i18n}> 
    <NotificationProvider>
      <AuthProvider>
        <UserProvider>
          <ThemeContextProvider>
            <AppProvider>
              <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <App />
              </BrowserRouter>
            </AppProvider>
          </ThemeContextProvider>
        </UserProvider>
      </AuthProvider>
    </NotificationProvider>
  </I18nextProvider> 
);