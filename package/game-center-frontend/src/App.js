// src/App.js

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import gameCenterTheme from './themes/GameCenterTheme';

function App() {
  return (
    <ThemeProvider theme={gameCenterTheme}>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;