import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Box } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import StarIcon from '@mui/icons-material/Star';
import GamesIcon from '@mui/icons-material/Games';

const iconMap = {
  EmojiEvents: <EmojiEventsIcon fontSize="large" color="primary" />,
  Whatshot: <WhatshotIcon fontSize="large" color="secondary" />,
  Star: <StarIcon fontSize="large" color="warning" />,
  Games: <GamesIcon fontSize="large" color="success" />,
};

/**
 * AchievementModal: oyun sonunda kazanılan başarımları gösterir
 * props:
 *  open: boolean
 *  achievements: Array<{id, title, icon}>
 *  onClose: function
 */
export default function AchievementModal({ open, achievements, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Başarımların</DialogTitle>
      <DialogContent>
        {achievements.length === 0 ? (
          <Typography sx={{ mt: 2 }}>Yeni bir başarı elde edemediniz.</Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {achievements.map(a => (
              <Grid item xs={6} key={a.id}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {iconMap[a.icon] || <EmojiEventsIcon />}
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