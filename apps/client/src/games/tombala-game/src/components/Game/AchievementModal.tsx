import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Box } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import StarIcon from '@mui/icons-material/Star';
import GamesIcon from '@mui/icons-material/Games';
import Looks5Icon from '@mui/icons-material/Looks5';
import StarHalfIcon from '@mui/icons-material/StarHalf';

const iconMap = {
  first_game: <EmojiEventsIcon fontSize="large" color="primary" />,  // İlk oyun
  five_games: <Looks5Icon fontSize="large" color="info" />,       // 5 oyun tamamlandı
  ten_games: <GamesIcon fontSize="large" color="success" />,        // 10 oyun tamamlandı
  score_100: <StarIcon fontSize="large" color="warning" />,        // 100 puan
  score_200: <StarHalfIcon fontSize="large" color="secondary" />,  // 200 puan
  score_500: <WhatshotIcon fontSize="large" color="secondary" />,  // 500 puan
};

/**
 * Tombala AchievementModal: kullanıcıya ait tombala başarımlarını gösterir
 * props:
 *   open: boolean
 *   achievements: Array<{ id: string; title: string; description: string }>
 *   onClose: () => void
 */
export default function AchievementModal({ open, achievements, onClose }: { open: boolean; achievements: Array<{ id: string; title: string; description: string }>; onClose: () => void; }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Başarımların</DialogTitle>
      <DialogContent>
        {achievements.length === 0 ? (
          <Typography sx={{ mt: 2 }}>Henüz bir başarı elde edemediniz.</Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {achievements.map(a => (
              <Grid item xs={6} key={a.id}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {iconMap[a.id] || <EmojiEventsIcon fontSize="large" />}
                  <Typography sx={{ mt: 1, textAlign: 'center', fontWeight: 'bold' }}>{a.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>{a.description}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
} 