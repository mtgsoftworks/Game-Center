/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState, useContext } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { NumericFormat } from 'react-number-format';
import { motion } from 'framer-motion';
import { getGames } from '../services/gameService';
import { getLobbies, deleteLobby } from '../services/lobbyService';
import game2048Image from '../assets/2048.png';
import { AppContext } from '../context/AppContext';

const tombolaImage = 'https://via.placeholder.com/300x150?text=Tombola';

function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useContext(AppContext);
  const userName = state.auth.user?.name || '';
  const [games, setGames] = useState([]);
  const [lobbies, setLobbies] = useState([]);
  const [now, setNow] = useState(new Date());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lobbyToDelete, setLobbyToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const gamesData = await getGames();
      setGames(gamesData);

      const lobbiesData = await getLobbies();
      setLobbies(lobbiesData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountdown = target => {
    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const eightHoursMs = 8 * 60 * 60 * 1000;
  const displayLobbies = [
    ...lobbies.filter(l => l.type === 'event' && new Date(l.endDate).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
    ...lobbies.filter(l => l.type === 'normal' && (now.getTime() - new Date(l.createdAt).getTime() < eightHoursMs))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  ];

  const renderLobbyStatus = lobby => {
    if (lobby.type === 'event') {
      const start = new Date(lobby.startDate);
      const end = new Date(lobby.endDate);
      if (start.getTime() > now.getTime()) {
        return (start.getTime() - now.getTime() > 86400000)
          ? `${t('startsAt')}: ${format(start, 'Pp')}`
          : `${t('startsIn')}: ${getCountdown(start)}`;
      }
      if (now.getTime() <= end.getTime()) {
        return t('ongoing');
      }
      return t('ended');
    }
    // normal lobby
    const hoursAgo = Math.floor((now.getTime() - new Date(lobby.createdAt).getTime()) / 3600000);
    return t('createdAgo', { hours: hoursAgo });
  };

  const handleCreateLobby = () => {
    navigate('/create-lobby');
  };

  const openDeleteDialog = lobby => { setLobbyToDelete(lobby); setDeleteDialogOpen(true); };
  const closeDeleteDialog = () => { setLobbyToDelete(null); setDeleteDialogOpen(false); };
  const confirmDelete = async () => {
    try { await deleteLobby(lobbyToDelete._id); setLobbies(prev => prev.filter(l => l._id !== lobbyToDelete._id)); }
    catch (error) { console.error('Delete error:', error); }
    closeDeleteDialog();
  };

  // animation variants for game cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container>
      {/* Greeting and controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
        <Typography variant="h6">{`Hoş geldiniz, ${userName}`}</Typography>
        <Box>
          <Button size="small" onClick={() => dispatch({ type: 'SET_THEME_MODE', payload: state.themeMode === 'ui' ? 'game' : 'ui' })}>{t('themeToggle')}</Button>
          <Button size="small" onClick={() => navigate('/settings')}>{t('settings')}</Button>
        </Box>
      </Box>
      <Typography variant="h4" align="center" mt={5}>
        {t('homePage')}
      </Typography>
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">{t('games')}</Typography>
          <Typography variant="subtitle1" gutterBottom>
            Toplam Oyun: <NumericFormat value={games.length} displayType="text" thousandSeparator />
          </Typography>
          {games.map((game, idx) => (
            <motion.div
              key={game.id}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card sx={{ mb: 2 }}>
                <CardMedia component="img" src={game.id === '2048' ? game2048Image : tombolaImage} alt={game.name} sx={{ width: '100%', height: 'auto', mb: 1 }} />
                <CardContent>
                  <Typography variant="h6">{game.name}</Typography>
                  <Typography>{game.description}</Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    {t('howToPlay')}: {game.id === '2048'
                      ? 'Slide tiles to combine numbers until you reach 2048.'
                      : 'Mark numbers on your card and complete a line or full house to win.'}
                  </Typography>
                </CardContent>
                <Button variant="contained" color="primary" disabled sx={{ mt: 1 }}>
                  {t('play')}
                </Button>
              </Card>
            </motion.div>
          ))}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">{t('lobbies')}</Typography>
          <Typography variant="subtitle1" gutterBottom>
            Toplam Lobby: <NumericFormat value={displayLobbies.length} displayType="text" thousandSeparator />
          </Typography>
          {displayLobbies.map(lobby => (
            <Card key={lobby._id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{lobby.name}</Typography>
                <Typography variant="body2">{renderLobbyStatus(lobby)}</Typography>
                {lobby.password && <Typography>{t('passwordProtected')}</Typography>}
              </CardContent>
              <Button variant="contained" color="primary" onClick={() => navigate(`/lobbies/${lobby._id}/chat`)}>
                {t('join')}
              </Button>
              <Button size="small" onClick={() => navigate(`/lobbies/${lobby._id}/edit`)}>
                {t('editLobby')}
              </Button>
              <Button size="small" color="error" onClick={() => openDeleteDialog(lobby)}>
                {t('deleteLobby')}
              </Button>
            </Card>
          ))}
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleCreateLobby}>
        {t('createLobby')}
      </Button>
      {/* Footer */}
      <Box mt={4} pb={2}>
        <Typography variant="caption" align="center">
          2025 &copy; MTG Softworks All Rights Reserved. Web tasarım için <Link href="https://www.figma.com" target="_blank" rel="noopener">Figma</Link> kullanabilirsiniz.
        </Typography>
      </Box>
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>{t('deleteLobby')}</DialogTitle>
        <DialogContent><Typography>{t('deleteConfirmation')}</Typography></DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>{t('cancel')}</Button>
          <Button color="error" onClick={confirmDelete}>{t('deleteLobby')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default HomePage;