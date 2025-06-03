import React, { useContext } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, IconButton, Button, Chip, Tooltip, ListItemIcon } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OnlineIndicator from '../atoms/OnlineBadge';
import BarChartIcon from '@mui/icons-material/BarChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EventIcon from '@mui/icons-material/Event';
import ChatIcon from '@mui/icons-material/Chat';
import { UserContext } from '../../contexts/UserContext';

// Örnek arkadaş verisi (API'den gelmeli)
const sampleFriends = [
  { id: 1, name: 'Ahmet Yılmaz', avatar: '/avatars/avatar1.jpg', status: 'online' },
  { id: 2, name: 'Ayşe Kaya', avatar: '/avatars/avatar2.jpg', status: 'offline' },
  { id: 3, name: 'Zeynep Çelik', avatar: '/avatars/avatar3.jpg', status: 'online' },
];

// Örnek etkinlik verisi (API'den gelmeli)
const sampleEvents = [
  { id: 1, name: 'Haftalık Tombala Turnuvası', time: 'Yarın, 20:00', game: 'Tombala' },
  { id: 2, name: '2048 Skor Yarışı', time: '2 gün sonra, 18:00', game: '2048' },
];

function RightSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // Gerçek kullanıcı verisi için (henüz kullanılmıyor)

  // Örnek veriler (API'dan çekilecek)
  const userStats = {
    playedGames: user?.stats?.gamesPlayed || 23,
    winRate: user?.stats?.winRate || '65%',
    badges: user?.stats?.badges || ['Usta Oyuncu', 'Takım Lideri', 'Sportmen'],
  };

  const upcomingEvents = [
    { id: 1, name: 'Haftalık Valorant Turnuvası', time: 'Yarın 18:00', game: 'Valorant' },
    { id: 2, name: 'LoL 1v1 Kapışması', time: '2 gün sonra', game: 'League of Legends' },
    { id: 3, name: 'FIFA Gece Ligi Başlıyor', time: '15.07.2024 20:00', game: 'FIFA 23' },
  ];

  return (
    <Paper 
      elevation={2} // Biraz daha yumuşak bir gölge
      sx={{
        width: 300,
        height: 'calc(100vh - 64px - 16px)', // AppBar (64px) ve biraz padding için yükseklik ayarı
        maxHeight: 'calc(100vh - 64px - 16px)',
        overflowY: 'auto',
        p: 2,
        display: { xs: 'none', md: 'block' },
        position: 'sticky', // Sayfa kaydırıldığında sabit kalması için
        top: 'calc(64px + 8px)', // AppBar yüksekliği + biraz boşluk
        borderRadius: theme => theme.shape.borderRadius * 2, // Daha yuvarlak kenarlar
        ml: 2, // Sol taraftaki ana içerikten ayırmak için
      }}
    >
      {/* Kullanıcı İstatistikleri */}
      <Box mb={3}>
        <Typography variant="h6" sx={{fontWeight: 'bold', mb: 1.5}}>{t('kullaniciIstatistikleri', 'İstatistiklerin')}</Typography>
        <Box display="flex" justifyContent="space-around" textAlign="center" mb={1.5}>
            <Box>
                <Typography variant="h5" sx={{fontWeight: 500}}>{userStats.playedGames}</Typography>
                <Typography variant="caption" color="text.secondary">{t('oynananOyun', 'Oynanan Oyun')}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
                <Typography variant="h5" sx={{fontWeight: 500}}>{userStats.winRate}</Typography>
                <Typography variant="caption" color="text.secondary">{t('kazanmaOrani', 'Kazanma Oranı')}</Typography>
            </Box>
        </Box>
        <Typography variant="subtitle2" sx={{fontWeight: 'bold', mb: 0.5, color: 'text.secondary'}}>{t('rozetler', 'Rozetler')}</Typography>
        <Box display="flex" gap={1}>
            {userStats.badges.slice(0,5).map(badge => (
                <Tooltip title={badge} key={badge} placement="top">
                    <Chip label={badge} size="small" variant="outlined" onClick={() => { /* Rozet detayına git */ }} sx={{maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis'}} />
                </Tooltip>
            ))}
            {userStats.badges.length > 5 && <Chip label={`+${userStats.badges.length - 5}`} size="small"/>}
        </Box>
      </Box>
      <Divider sx={{my:2}}/>

      {/* Yakında Başlayacak Etkinlikler */}
      <Box mb={3}>
        <Typography variant="h6" sx={{fontWeight: 'bold', mb: 1}}>{t('yaklasanEtkinlikler', 'Yaklaşan Etkinlikler')}</Typography>
        <List dense disablePadding>
          {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
            <ListItem key={event.id} disablePadding sx={{mb: 0.5}}>
              <ListItemIcon sx={{minWidth: 30}}>
                <EventIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="body2" sx={{fontWeight:500}}>{event.name}</Typography>} 
                secondary={`${event.game} - ${event.time}`}
              />
            </ListItem>
          )) : (
            <Typography variant="body2" color="text.secondary">{t('yaklasanEtkinlikYok', 'Yakın zamanda planlanmış bir etkinlik bulunmuyor.')}</Typography>
          )}
        </List>
      </Box>
      <Divider sx={{my:2}}/>

      {/* Arkadaş Listesi */}
      <Box mb={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{fontWeight: 'bold'}}>{t('arkadasListesi', 'Arkadaşlarım')}</Typography>
          <IconButton size="small" aria-label={t('dahaFazlaSecenek', 'Daha Fazla Seçenek')}>
            <MoreVertIcon />
          </IconButton>
        </Box>
        <List dense disablePadding>
          {sampleFriends.map(friend => (
            <ListItem 
              key={friend.id}
              disablePadding 
              sx={{mb:0.5}}
              secondaryAction=
                {friend.status === 'online' && <OnlineIndicator /> }
            >
              <ListItemAvatar sx={{minWidth: 40}}>
                <Avatar alt={friend.name} src={friend.avatar || '/'} sx={{ width: 32, height: 32}} />
              </ListItemAvatar>
              <ListItemText primary={friend.name} />
            </ListItem>
          ))}
          {sampleFriends.length === 0 && (
              <Typography variant="body2" color="text.secondary">{t('arkadasBulunamadi', 'Henüz hiç arkadaşın yok.')}</Typography>
          )}
        </List>
      </Box>
      <Divider sx={{my:2}}/>

      {/* Sohbet Bölümüne Erişim Butonu */}
      <Box textAlign="center">
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<ChatIcon />} 
          onClick={() => navigate('/chat')} // /chat sayfasına yönlendir
          fullWidth
        >
          {t('sohbeteGit', 'Sohbete Git')}
        </Button>
      </Box>
    </Paper>
  );
}

export default RightSidebar; 