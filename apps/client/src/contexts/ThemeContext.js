import React, { createContext, useState, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

// Dark (karanlık) tema
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3f51b5' },
    secondary: { main: '#ff4081' },
    background: {
      default: '#212121',
      paper: '#333333'
    },
    text: {
      primary: '#ffffff',
      secondary: '#f5f5f5'
    }
  },
  typography: {
    fontFamily: 'Roboto, sans-serif'
  }
});

// Light (açık) tema
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3f51b5' },
    secondary: { main: '#ff4081' },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    text: {
      primary: '#212121',
      secondary: '#333333'
    }
  },
  typography: {
    fontFamily: 'Roboto, sans-serif'
  }
});

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Başlangıçta localStorage'dan tema modu okunuyor (light veya dark)
  const savedTheme = localStorage.getItem('themeMode') || 'light';
  const [currentTheme, setCurrentTheme] = useState(savedTheme);

  // currentTheme 'dark' ise darkMode, aksi halde lightMode
  const theme = currentTheme === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setCurrentTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('themeMode', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext); 