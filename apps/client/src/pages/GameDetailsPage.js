import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Container, Paper, Box, Button, CircularProgress, Alert, CardMedia, Grid, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getGameDetails } from '../services/gameService';
import { getLobbies } from '../services/lobbyService'; // Bu oyuna ait lobileri listelemek için

function GameDetailsPage() {
  const { t } = useTranslation();
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [lobbies, setLobbies] = useState([]);
  const [loadingGame, setLoadingGame] = useState(true);
  const [loadingLobbies, setLoadingLobbies] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      setLoadingGame(true);
      setError(null);
      try {
        const gameData = await getGameDetails(gameId);
        setGame(gameData);
        // Oyuna ait lobileri de çek
        setLoadingLobbies(true);
        const lobbyData = await getLobbies({ gameId: gameId }); // Backend'in gameId ile filtrelemeyi desteklediğini varsayalım
        setLobbies(lobbyData);
        setLoadingLobbies(false);
      } catch (err) {
        setError(err.message || t('gameDetailsFetchError', 'Oyun detayları getirilemedi.'));
        console.error("Oyun detayları getirilirken hata:", err);
      }
      setLoadingGame(false);
    };

    if (gameId) {
      fetchGameDetails();
    }
  }, [gameId, t]);

  if (loadingGame) {
    return <Container sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Container>;
  }

  if (error) {
    return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  if (!game) {
    return <Container sx={{ py: 4 }}><Typography variant="h5">{t('gameNotFound', 'Oyun bulunamadı.')}</Typography></Container>;
  }

  return (
    <Container sx={{ py: 4 }} maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <CardMedia
              component="img"
              image={game.imageUrl || `https://via.placeholder.com/300x200?text=${game.name.replace(/\s/g, '+')}`}
              alt={game.name}
              sx={{ borderRadius: 1, maxHeight: 300, objectFit: 'cover' }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom>
              {game.name}
            </Typography>
            <Typography variant="body1" paragraph sx={{whiteSpace: 'pre-wrap'}}>
              {game.description || t('noDescriptionAvailable', 'Bu oyun için henüz bir açıklama yok.')}
            </Typography>
            {/* Gerekirse oyun kuralları, geliştirici bilgisi vb. eklenebilir */}
            <Button variant="contained" color="primary" onClick={() => alert(t('playGameNotImplemented', 'Oyunu oyna özelliği yakında!'))} sx={{mt:2}}>
              {t('playGame', 'Oyunu Oyna')} 
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{mt: 4, mb: 2}}>{t('activeLobbiesForThisGame', 'Bu Oyuna Ait Aktif Lobiler')}</Typography>
      {loadingLobbies && <CircularProgress />}
      {!loadingLobbies && lobbies.length === 0 && (
        <Typography>{t('noActiveLobbiesForThisGame', 'Bu oyun için şu anda aktif lobi bulunmuyor.')}</Typography>
      )}
      {!loadingLobbies && lobbies.length > 0 && (
        <Grid container spacing={2}>
          {lobbies.map((lobby) => (
            <Grid item xs={12} sm={6} md={4} key={lobby._id || lobby.id}>
              <Paper sx={{p:2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <Box>
                  <Typography variant="h6">{lobby.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('participants')}: {lobby.currentParticipants || 0} / {lobby.maxParticipants}
                  </Typography>
                  <Chip 
                    label={lobby.isPrivate ? t('private') : (lobby.type === 'event' ? t('event') : t('public'))} 
                    size="small" 
                    color={lobby.isPrivate ? 'warning' : (lobby.type === 'event' ? 'secondary' : 'default')}
                    sx={{mt:1}}
                  />
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{mt:2}}
                  onClick={() => navigate(`/lobbies/${lobby._id || lobby.id}`)}
                >
                  {t('joinLobby')}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
       <Button variant="outlined" onClick={() => navigate(-1)} sx={{mt:3}}>{t('back', 'Geri')}</Button>
    </Container>
  );
}

export default GameDetailsPage; 