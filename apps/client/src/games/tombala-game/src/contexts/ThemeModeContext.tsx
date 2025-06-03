import React, { createContext, useState, useContext, useMemo, ReactNode, useCallback, useEffect } from 'react';
import { PaletteMode } from '@mui/material';

type ThemeModeContextType = {
  mode: PaletteMode;
  toggleThemeMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
}

interface ThemeModeProviderProps {
  children: ReactNode;
}

export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  // Get initial mode from localStorage or default to 'light'
  const getInitialMode = (): PaletteMode => {
    try {
      const storedMode = window.localStorage.getItem('themeMode');
      return storedMode === 'dark' ? 'dark' : 'light';
    } catch (e) {
      console.error("Could not read themeMode from localStorage", e);
      return 'light'; // Default to light on error
    }
  };

  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  // Update localStorage when mode changes
  useEffect(() => {
    try {
      window.localStorage.setItem('themeMode', mode);
    } catch (e) {
      console.error("Could not save themeMode to localStorage", e);
    }
  }, [mode]);

  const toggleThemeMode = useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  // useMemo prevents unnecessary re-renders of consumers
  const value = useMemo(() => ({ mode, toggleThemeMode }), [mode, toggleThemeMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
} 