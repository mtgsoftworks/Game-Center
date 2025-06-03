import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Grid, Typography, Card, CardContent, CardMedia } from '@mui/material';

const games = [
  {
    id: 'tombala',
    name: 'Tombala',
    path: '/games/tombala',
    description: 'Klasik Türk Tombalası',
    image: '/images/tombala-preview.jpg'
  },
  {
    id: '2048',
    name: '2048',
    path: '/games/2048',
    description: 'Popüler 2048 Oyunu',
    image: '/images/2048-preview.jpg'
  }
];

export const GameMenu = () => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3} padding={3}>
      {games.map((game) => (
        <Grid item xs={12} sm={6} md={4} key={game.id}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image={game.image}
              alt={game.name}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {game.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {game.description}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate(game.path)}
              >
                Oyna
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}; 