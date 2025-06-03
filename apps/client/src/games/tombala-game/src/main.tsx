/**
 * src/main.tsx: Uygulamanın başlangıç dosyası. React ağacını oluşturur ve tema, dil, global stiller sağlar.
 * React uygulamasını başlatır ve kök bileşen olarak App'i render eder.
 * Tema yönetimi, Material UI ve global stilleri uygular.
 * Çoklu dil desteği ve tema modu sağlayıcılarını içerir.
 *
 * @returns {void}
 */

// React: JSX dönüştürmesi için gereklidir
import React from 'react';
// React DOM: Uygulamayı DOM'a bağlar
import ReactDOM from 'react-dom/client';
// MUI: Tema sağlayıcı ve CSS sıfırlama
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { deepPurple, grey, amber } from '@mui/material/colors'; // Import colors
// Global CSS: Tailwind ve diğer stiller
import './index.css';
import App from './App';
// i18n yapılandırması: çoklu dil desteği
import './i18n';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SoundProvider } from './contexts/SoundContext';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeModeContext';

// AppThemeProvider: useThemeMode'dan gelen moda göre MUI teması oluşturur
const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode } = useThemeMode(); // Get the current mode from context

  // Tema oluşturma ayarları
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode, // Use mode from context
      ...(mode === 'light'
        ? { // Light mode palette
            primary: {
              main: deepPurple[500],
            },
            secondary: {
              main: amber[700],
            },
            background: {
                default: grey[100],
                paper: grey[50],
            },
          }
        : { // Dark mode palette
            primary: {
              main: deepPurple[400],
            },
            secondary: {
              main: grey[500],
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
          }),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8, // Slightly rounded buttons
          },
        },
      },
      MuiPaper: {
           styleOverrides: {
              root: {
                  // Ensure dark mode paper doesn't have gradient overlay if needed
                  backgroundImage: mode === 'dark' ? 'none' : undefined,
              }
           }
      }
      // Add more component overrides here if needed
    },
  }), [mode]); // Recreate theme only when mode changes

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline: global CSS sıfırlama */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* StrictMode: ek hata denetimleri ve uyarılar */}
    <AuthProvider>
      <NotificationProvider>
        <SoundProvider>
          <ThemeModeProvider>
            <AppThemeProvider>
              {/* Suspense for i18n needs to be inside providers */} 
              <React.Suspense fallback="Loading...">
                <App />
              </React.Suspense>
            </AppThemeProvider>
          </ThemeModeProvider>
        </SoundProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>,
);
