// src/pages/SinglePlayerGamePage.js
import React, { useState } from 'react';
import { Container, Typography, Button } from '@mui/material';

function SinglePlayerGamePage() {
  const [score, setScore] = useState(0);

  const handlePlay = () => {
    // Oyun mantığı burada uygulanır
    const randomScore = Math.floor(Math.random() * 100);
    setScore(randomScore);
    console.info(`Oyun bitti! Skorunuz: ${randomScore}`);
  };

  return (
    <Container>
      <Typography variant="h4" mt={5}>Tek Kişilik Oyun</Typography>
      <Typography variant="h6">Skorunuz: {score}</Typography>
      <Button variant="contained" color="primary" onClick={handlePlay}>
        Oyna
      </Button>
    </Container>
  );
}

export default SinglePlayerGamePage;