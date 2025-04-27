// src/App.js

import React, { useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import AppRoutes from './routes/Routes';
import gameCenterTheme from './themes/GameCenterTheme';
import gameTheme from './themes/GameTheme';
import { AppContext } from './context/AppContext';

function App() {
  const { state } = useContext(AppContext);
  const theme = state.themeMode === 'game' ? gameTheme : gameCenterTheme;
  return (
    <ThemeProvider theme={theme}>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;