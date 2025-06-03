import React, { useContext } from 'react';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Avatar,
  Paper,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Stars as AchievementIcon,
  Event as EventIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../contexts/UserContext';

export const DRAWER_WIDTH = 280;

function Sidebar({ open, onClose, variant = 'permanent', onChatOpen }) {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);

  // Örnek veriler (gerçek uygulamada API'den gelecek)
  const userStats = {
    gamesPlayed: 42,
    winRate: 65,
    achievements: [
      { id: 1, name: t('firstWin', 'İlk Galibiyet'), earned: true },
      { id: 2, name: t('tenGamesPlayed', '10 Oyun Tamamlandı'), earned: true },
      { id: 3, name: t('winStreak', '3 Galibiyet Serisi'), earned: false },
    ],
    level: 5,
    xp: 750,
    nextLevelXp: 1000
  };

  const upcomingEvents = [
    {
      id: 1,
      name: t('weekendTournament', 'Hafta Sonu Turnuvası'),
      time: '2024-03-23T15:00:00Z',
      game: 'Chess'
    },
    {
      id: 2,
      name: t('specialEvent', 'Özel Etkinlik'),
      time: '2024-03-24T18:00:00Z',
      game: 'Poker'
    }
  ];

  const sidebarContent = (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Kullanıcı İstatistikleri */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={user?.photoURL}
            alt={user?.displayName}
            sx={{ width: 40, height: 40, mr: 1 }}
          />
          <Box>
            <Typography variant="subtitle1" noWrap>
              {user?.displayName || t('anonymousUser', 'Anonim Kullanıcı')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('level', 'Seviye')} {userStats.level}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            XP: {userStats.xp} / {userStats.nextLevelXp}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(userStats.xp / userStats.nextLevelXp) * 100}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <TrophyIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('gamesPlayed', 'Oynanan Oyunlar')}
              secondary={userStats.gamesPlayed}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AchievementIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('winRate', 'Kazanma Oranı')}
              secondary={`%${userStats.winRate}`}
            />
          </ListItem>
        </List>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* Başarımlar */}
      <Typography variant="h6" gutterBottom>
        {t('achievements', 'Başarımlar')}
      </Typography>
      <List dense sx={{ mb: 2 }}>
        {userStats.achievements.map((achievement) => (
          <ListItem key={achievement.id}>
            <ListItemIcon>
              <Badge color={achievement.earned ? 'success' : 'default'} variant="dot">
                <AchievementIcon color={achievement.earned ? 'primary' : 'disabled'} />
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary={achievement.name}
              sx={{ opacity: achievement.earned ? 1 : 0.5 }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Yaklaşan Etkinlikler */}
      <Typography variant="h6" gutterBottom>
        {t('upcomingEvents', 'Yaklaşan Etkinlikler')}
      </Typography>
      <List dense>
        {upcomingEvents.map((event) => (
          <ListItem key={event.id}>
            <ListItemIcon>
              <EventIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={event.name}
              secondary={
                <>
                  {event.game}
                  <br />
                  {new Date(event.time).toLocaleString()}
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Chip
          icon={<ChatIcon />}
          label={t('openChat', 'Sohbeti Aç')}
          onClick={onChatOpen}
          color="primary"
          variant="outlined"
          sx={{ width: '100%' }}
        />
      </Box>
    </Box>
  );

  if (variant === 'temporary') {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        variant={variant}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant={variant}
      anchor="right"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
      open
    >
      {sidebarContent}
    </Drawer>
  );
}

export default Sidebar; 