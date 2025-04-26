import React from 'react';
import { Container, Typography } from '@mui/material';
import ChatPlaceholder from '../components/ChatPlaceholder';

function LobbyChatPage() {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" mt={5}>
        Lobi Sohbet
      </Typography>
      <ChatPlaceholder />
    </Container>
  );
}

export default LobbyChatPage;