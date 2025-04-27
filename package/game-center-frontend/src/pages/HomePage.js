/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState, useContext } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Chip, TextField, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { NumericFormat } from 'react-number-format';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { getCurrentUser } from '../services/authService';
import { getGames } from '../services/gameService';
import { getLobbies, deleteLobby } from '../services/lobbyService';

// Tombala ve 2048 oyun logoları public klasöründen
const tombolaImage = '/tombala_logo.png';
const image2048 = '/2048.png';

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
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // Kullanıcı bilgisi al ve context'e kaydet
      const userData = await getCurrentUser();
      if (userData) dispatch({ type: 'SET_USER', payload: { user: userData, token: state.auth.token } });
      // Oyun ve lobi verilerini getir
      const gamesData = await getGames();
      setGames(gamesData);
      const lobbiesData = await getLobbies();
      setLobbies(lobbiesData);
    };
    fetchData();
  }, [dispatch, state.auth.token]);

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
                <CardMedia component="img" src={game.id === '2048' ? image2048 : tombolaImage} alt={game.name} sx={{ width: '100%', height: 'auto', mb: 1 }} />
                <CardContent>
                  <Typography variant="h6">{game.name}</Typography>
                  <Typography>{game.description}</Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('howToPlay')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {game.id === '2048'
                      ? t('howToPlay_2048')
                      : t('howToPlay_bingo')}
                  </Typography>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">{t('rules')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List disablePadding>
                        {game.id === '2048' ? (
                          <> {/* 2048 kuralları */}
                            <ListItem><ListItemText primary="1. Tahtada 4×4 blok; değer 2 veya 4."/></ListItem>
                            <ListItem><ListItemText primary="2. Ok tuşları veya kaydırmayla bloklar kaydırılır."/></ListItem>
                            <ListItem><ListItemText primary="3. Aynı bloklar birleşir (örn.2+2=4)."/></ListItem>
                            <ListItem><ListItemText primary="4. Her hamleden sonra rastgele 2 veya 4 eklenir."/></ListItem>
                            <ListItem><ListItemText primary="5. Hamle kalmadığında oyun biter."/></ListItem>
                            <ListItem><ListItemText primary="6. 2048 sayısına ulaşıldığında kazanılır."/></ListItem>
                          </>
                        ) : (
                          <> {/* Tombala kuralları */}
                            <ListItem><ListItemText primary="1. Her oyuncuya 5×5 kart verilir."/></ListItem>
                            <ListItem><ListItemText primary="2. Host belirli aralıklarla sayı çeker."/></ListItem>
                            <ListItem><ListItemText primary="3. Çekilen sayı işaretlenir."/></ListItem>
                            <ListItem><ListItemText primary="4. Tek satır/sütun/çapraz tamamlayan kazanır."/></ListItem>
                            <ListItem><ListItemText primary="5. Tüm hücreler işaretlenir: Full Tombala."/></ListItem>
                            <ListItem><ListItemText primary="6. İlk tamamlayan ödülü alır."/></ListItem>
                          </>
                        )}
                      </List>
                    </AccordionDetails>
                  </Accordion>
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
                <Box display="flex" alignItems="center" mb={1}>
                  {lobby.password && <Chip label="Şifreli" size="small" color="warning" sx={{ mr: 1 }} />}
                  {lobby.type === 'event' && <Chip label="Etkinlik" size="small" color="primary" />}
                </Box>
                <Typography variant="body2">{renderLobbyStatus(lobby)}</Typography>
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
      {/* Dummy bileşenler */}
      <Grid container spacing={3} mt={4} id="chat-section">
        <Grid item xs={12} md={4}>
          <Typography variant="h6">{t('chat')}</Typography>
          <Box sx={{ border: '1px dashed grey', height: 200, p: 2 }}>{t('chat')} bileşeni için taslak</Box>
          <Box mt={2} display="flex" alignItems="center">
            <TextField
              label={t('inviteCode')}
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(`/lobbies/${inviteCode}/chat`)}
            >{t('joinByCode')}</Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">{t('statistics')}</Typography>
          <Box sx={{ border: '1px dashed grey', p: 2 }}>{t('statisticsComingSoon')}</Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">{t('achievements')}</Typography>
          <Box sx={{ border: '1px dashed grey', p: 2 }}>{t('achievementsComingSoon')}</Box>
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleCreateLobby}>
        {t('createLobby')}
      </Button>
      {/* Footer */}
      <Box mt={4} pb={2}>
        <Typography variant="caption" align="center">
          2025 &copy; MTG Softworks All Rights Reserved.
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