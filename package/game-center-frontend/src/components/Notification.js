// src/components/Notification.js
import React from 'react';
import { Snackbar } from '@mui/material';

function Notification({ open, message, handleClose }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      message={message}
      onClose={handleClose}
    />
  );
}

export default Notification;