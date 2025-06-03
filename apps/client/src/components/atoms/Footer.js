import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => (
  <Box component="footer" sx={{ bgcolor: 'background.paper', py: 2, mt: 4, textAlign: 'center' }}>
    <Typography variant="body2" color="textSecondary">
      © 2025 Game Center. Tüm hakları saklıdır.
    </Typography>
  </Box>
);

export default Footer; 