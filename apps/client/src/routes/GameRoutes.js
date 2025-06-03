import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';

// LoadingScreen komponenti
const LoadingScreen = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <div>Yükleniyor...</div>
  </div>
);

// Oyunları lazy loading ile import ediyoruz
const TombalaGame = lazy(() => import('../games/tombala-game/src/App'));
const Game2048 = lazy(() => import('../games/game-2048/lib/index.js'));

export const GameRoutes = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route
        path="/games/tombala"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <TombalaGame />
          </Suspense>
        }
      />
      <Route
        path="/games/2048"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <Game2048 />
          </Suspense>
        }
      />
    </Routes>
    </BrowserRouter>
  );
}; 