import React from 'react';
import { Container, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import Chat from '../components/Chat';

function LobbyChatPage() {
  const { id } = useParams();
  return (
    <Container maxWidth="md">
      <Typography variant="h4" mt={5}>
        Lobi Sohbet
      </Typography>
      <Chat channel={id} />
    </Container>
  );
}

export default LobbyChatPage;