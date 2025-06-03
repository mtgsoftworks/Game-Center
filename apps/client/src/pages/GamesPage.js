import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { getGames } from '../services/gameService';

function GamesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await getGames();
        setGames(data);
      } catch (err) {
        setError(t('gamesLoadError', 'Oyunlar yüklenirken bir hata oluştu.'));
        console.error('Oyunlar yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [t]);

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          {t('games')}
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder={t('searchGames', 'Oyunlarda ara...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {filteredGames.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game._id || game.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={game.imageUrl || `https://via.placeholder.com/300x200?text=${game.name.replace(/\s/g, '+')}`}
                alt={game.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {game.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {game.description?.slice(0, 100)}
                  {game.description?.length > 100 ? '...' : ''}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${game.activeLobbies || 0} ${t('activeLobbies')}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  {game.tags?.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" />
                  ))}
                </Box>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate(`/games/${game._id || game.id}`)}
                >
                  {t('viewDetails', 'Detayları Gör')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredGames.length === 0 && (
        <Typography sx={{ textAlign: 'center', mt: 4 }}>
          {searchTerm 
            ? t('noGamesFound', 'Arama kriterlerinize uygun oyun bulunamadı.') 
            : t('noGamesAvailable', 'Henüz oyun bulunmuyor.')}
        </Typography>
      )}
    </Container>
  );
}

export default GamesPage; 