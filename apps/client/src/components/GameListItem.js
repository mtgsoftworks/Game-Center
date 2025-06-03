/**
 * src/components/GameListItem.js: Oyun listesi öğesi bileşeni.
 * Tek bir oyunu Card formatında gösterir; başlık, açıklama ve resim içerir.
 *
 * Props:
 *  - game: Oyun bilgilerini içeren nesne ({ name, description, image }).
 *
 * @param {Object} props.game - Görüntülenecek oyun bilgisi.
 * @returns {JSX.Element} Oyun kartı bileşeni.
 */
import React from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';

function GameListItem({ game }) {
  return (
    <Card sx={{ display: 'flex', mb: 2 }}>
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image={game.image}
        alt={game.name}
      />
      <CardContent>
        <Typography component="div" variant="h5">
          {game.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" component="div">
          {game.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GameListItem;