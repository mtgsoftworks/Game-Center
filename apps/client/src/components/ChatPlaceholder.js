/**
 * src/components/ChatPlaceholder.js: Sohbet placeholder bileşeni.
 * Kanal sohbeti eklenene kadar kullanıcıya bir placeholder gösterir.
 *
 * @returns {JSX.Element} Chat placeholder bileşeni.
 */
import React from 'react';
import { Box, Typography } from '@mui/material';

function ChatPlaceholder({ message = 'Henüz mesaj yok' }) {
  return (
    <Box sx={{ mt: 3, p: 2, border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
      <Typography variant="h6" color="textSecondary">
        {message}
      </Typography>
    </Box>
  );
}

export default ChatPlaceholder;