// src/pages/GameDetailPage.js

/* eslint-disable import/no-unresolved */

import React, { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { Container, CircularProgress } from '@mui/material';

// Lazy-load Lerna-managed game packages
const Lazy2048 = lazy(() => import('game-2048'));

function GameDetailPage() {
  const { gameId } = useParams();

  let GameComponent;
  if (gameId === '2048') {
    GameComponent = Lazy2048;
  } else {
    return <div>Game not found</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Suspense fallback={<CircularProgress />}>
        <GameComponent />
      </Suspense>
    </Container>
  );
}

export default GameDetailPage;