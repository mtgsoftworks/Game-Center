import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';

// Sohbet odası başlığı, geri ve ayarlar butonları
const ChatHeader = ({ title, onBack, onSettings }) => (
  <AppBar position="static" color="default" elevation={1} sx={{ mb: 1 }}>
    <Toolbar>
      <IconButton edge="start" color="inherit" onClick={onBack} aria-label="geri">
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} noWrap>
        {title}
      </Typography>
      <IconButton edge="end" color="inherit" onClick={onSettings} aria-label="ayarlar">
        <SettingsIcon />
      </IconButton>
    </Toolbar>
  </AppBar>
);

export default ChatHeader; 