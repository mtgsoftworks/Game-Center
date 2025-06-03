/**
 * src/pages/GameDetailPage.js: Oyun detay sayfası bileşeni.
 * URL parametresi ile belirtilen oyunun ayrıntılarını getirir.
 * Suspense ve lazy kullanarak bileşenleri dinamik olarak yükler.
 *
 * @returns {JSX.Element} Oyun detay sayfası bileşeni.
 */
/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

function GameDetailPage() {
  const { gameId, id } = useParams();
  const currentGameId = gameId || id;

  useEffect(() => {
    let url = '';
    if (currentGameId === '2048') {
      url = 'http://localhost:3002';
    } else if (currentGameId === 'tombala') {
      url = 'http://localhost:5173';
    } else {
      url = '/games';
    }
    window.location.href = url;
  }, [currentGameId]);

  return null;
}

export default GameDetailPage;