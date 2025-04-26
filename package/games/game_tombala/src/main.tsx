import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { deepPurple, grey, amber } from '@mui/material/colors'; // Import colors
import './index.css';
import App from './App';
// Import i18n configuration
import './i18n';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeModeContext';

// Component to dynamically create and provide the theme
const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode } = useThemeMode(); // Get the current mode from context

  // Create theme dynamically based on the mode
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
      {/* CssBaseline should be inside ThemeProvider to apply mode-specific styles */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ThemeModeProvider provides the mode value */}
    <ThemeModeProvider>
      {/* AppThemeProvider reads the mode and sets the MUI theme */}
      <AppThemeProvider>
        {/* Suspense for i18n needs to be inside providers */} 
        <React.Suspense fallback="Loading...">
          <App />
        </React.Suspense>
      </AppThemeProvider>
    </ThemeModeProvider>
  </React.StrictMode>,
);
