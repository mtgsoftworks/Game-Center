import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getGames } from '../services/gameService';
import { getLobbies } from '../services/lobbyService';

function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [lobbies, setLobbies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const gamesData = await getGames();
      setGames(gamesData);

      const lobbiesData = await getLobbies();
      setLobbies(lobbiesData);
    };

    fetchData();
  }, []);

  const handleCreateLobby = () => {
    navigate('/create-lobby');
  };

  return (
    <Container>
      <Typography variant="h4" align="center" mt={5}>
        {t('homePage')}
      </Typography>
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">{t('games')}</Typography>
          {games.map(game => (
            <Card key={game.id} style={{ marginBottom: '10px' }}>
              <CardContent>
                <Typography variant="h6">{game.name}</Typography>
                <Typography>{game.description}</Typography>
              </CardContent>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/games/${game.id}`)}
                sx={{ mt: 1 }}
              >
                {t('play')}
              </Button>
            </Card>
          ))}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">{t('lobbies')}</Typography>
          {lobbies.map(lobby => (
            <Card key={lobby._id} style={{ marginBottom: '10px' }}>
              <CardContent>
                <Typography variant="h6">{lobby.name}</Typography>
                <Typography>{lobby.type === 'event' ? t('eventLobby') : t('normalLobby')}</Typography>
                {lobby.password && <Typography>{t('passwordProtected')}</Typography>}
              </CardContent>
              <Button variant="contained" color="primary">
                {t('join')}
              </Button>
            </Card>
          ))}
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleCreateLobby}>
        {t('createLobby')}
      </Button>
    </Container>
  );
}

export default HomePage;