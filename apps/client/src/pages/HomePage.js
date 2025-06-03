/**
 * src/pages/HomePage.js: Uygulamanın ana sayfa bileşeni.
 * Kullanıcıya öne çıkan oyunlar, aktif lobiler ve istatistik özetleri sunar.
 * API'den çekilen veriler liste ve kart formatında gösterilir.
 *
 * @returns {JSX.Element} Ana sayfa bileşeni.
 */
import React, { useState, useContext, useEffect } from 'react';
import { Container, Typography, Grid, Box, IconButton, Menu, MenuItem, Avatar, Paper, InputBase, Divider, Tabs, Tab, Card, CardContent, CardActions, Button, CardMedia, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions as MuiDialogActions, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Select, InputLabel, OutlinedInput, Checkbox, ToggleButtonGroup, ToggleButton, CircularProgress, Alert } from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import trLocale from 'date-fns/locale/tr';
import { motion, AnimatePresence } from 'framer-motion';
import { getGames } from '../services/gameService';
import { UserContext } from '../contexts/UserContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// sampleGames artık kullanılmayacak, API'den çekilecek
// const sampleGames = [...];

function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  // const { state, dispatch } = useContext(AppContext); // Gerekirse
  // const userId = user?.id; // Örnek: Kullanıcı ID'si

  const [anchorEl, setAnchorEl] = useState(null);
  const openUserMenu = Boolean(anchorEl);

  // Oyun Listesi State'leri
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [gamesError, setGamesError] = useState(null);
  const [tombalaRooms, setTombalaRooms] = useState([]);
  const [now, setNow] = useState(Date.now());

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Çıkış işlemleri
    handleUserMenuClose();
    navigate('/login');
  };
  
  const handleNavigate = (path) => {
    handleUserMenuClose();
    navigate(path);
  };

  // Popüler oyunları çekmek için useEffect
  useEffect(() => {
    const fetchGames = async () => {
      setLoadingGames(true);
      setGamesError(null);
      try {
        // Örnek: Popüler ve limitli oyunları çekmek için filtre
        const popularGames = await getGames({ popular: true, limit: 6 }); // API'nizin bu filtreleri desteklediğini varsayalım
        setGames(popularGames);
      } catch (error) {
        console.error("Oyunlar yüklenirken hata oluştu:", error);
        setGamesError(error.message || 'Oyunlar yüklenirken bir sorun oluştu.');
      }
      setLoadingGames(false);
    };
    fetchGames();
  }, []); // Sadece component mount olduğunda çalışsın

  // Listen to Tombala rooms
  useEffect(() => {
    const q = query(collection(db, 'gameRooms'), where('status', '==', 'waiting'));
    const unsub = onSnapshot(q, snap => {
      setTombalaRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error('Rooms snapshot error:', err));
    return () => unsub();
  }, []);

  // Update now for countdowns
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format event detail
  const formatEventDetail = (room) => {
    const start = room.startTime?.toMillis?.() || 0;
    const end = room.endTime?.toMillis?.() || 0;
    if (now < start) {
      const diff = start - now;
      return `Başlayacak: ${Math.floor(diff/3600000)}h ${Math.floor(diff%3600000/60000)}m`;
    } else if (now < end) {
      const diff = end - now;
      return `Süreniz: ${Math.floor(diff/3600000)}h ${Math.floor(diff%3600000/60000)}m`;
    }
    return 'Etkinlik sona erdi';
  };

  return (
    // Ana sarmalayıcı Box: alignItems: 'center' kaldırıldı.
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Kullanıcı Menüsü ve Lobi Oluşturma Butonu (Bu kısım olduğu gibi kalabilir veya sayfa başına taşınabilir) */}
      {/* ... (Mevcut Fab, Menu vb. kodları buraya gelecek) ... */}
      {/* Bu kısım genellikle sayfanın sağ üst veya sağ alt köşesinde sabitlenir, 
          ancak şimdilik akışta bırakıyoruz. Gerekirse daha sonra konumlandırılabilir. */}

      {/* Popüler Oyunlar Bölümü */}
      <Box sx={{ width: '100%', maxWidth: 'lg', mb: 4, mt: 2, mx: 'auto' }}> 
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
          {t('populerOyunlar')}
        </Typography>
        {loadingGames && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
        {gamesError && <Alert severity="error">{gamesError}</Alert>}
        {!loadingGames && !gamesError && games.length === 0 && (
          <Typography sx={{ textAlign: 'center', my: 2 }}>{t('populerOyunBulunamadi', 'Şu anda popüler oyun bulunmuyor.')}</Typography>
        )}
        {!loadingGames && !gamesError && games.length > 0 && (
          <Grid container spacing={2}>
            {games.map((game) => (
              <Grid item xs={12} sm={6} md={4} key={game._id || game.id}>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={game.imageUrl || `https://via.placeholder.com/300x140?text=${game.name.replace(/\s/g, '+')}`}
                      alt={game.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {game.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {game.description || 'Bu oyun için henüz bir açıklama yok.'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{mt: 1, display: 'block'}}>
                        Aktif Lobiler: {game.activeLobbiesCount === undefined ? '-' : game.activeLobbiesCount}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          if (game.id === 'tombala') {
                            window.location.href = 'http://localhost:5173/';
                          } else if (game.id === '2048') {
                            window.location.href = 'http://localhost:3002/';
                          } else {
                            navigate(`/games/${game._id || game.id}`);
                          }
                        }}
                        sx={{
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': { transform: 'scale(1.05)' },
                          '&:active': { transform: 'scale(0.95)' }
                        }}
                      >
                        {t('oyna', 'Oyna')}
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
        {/* Tombala Odaları */}
        {tombalaRooms.length > 0 && (
          <Box sx={{ mt: 6 }}>  
            <Typography variant="h5" gutterBottom>{t('tombalaRooms', 'Tombala Odaları')}</Typography>
            <Grid container spacing={2}>
              {tombalaRooms.map(room => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{room.roomName || t('lobby')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('creator', 'Oluşturan')}: {room.creatorName}
                      </Typography>
                      {room.type === 'event' && (
                        <Typography variant="body2" color="primary">
                          {formatEventDetail(room)}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button size="small" variant="contained" onClick={() => window.open(`http://localhost:5173/game/${room.id}`, '_blank')}>
                        {t('join', 'Katıl')}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box> // Ana sarmalayıcı Box kapatıldı
  );
}

export default HomePage;