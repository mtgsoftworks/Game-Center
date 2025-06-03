// src/components/Notification.js
import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import Slide from '@mui/material/Slide';

function Notification({ open, message, severity = 'info', autoHide = 6000, handleClose }) {
  return (
    <Snackbar
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
      open={open}
      autoHideDuration={autoHide}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert role="alert" onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Notification;