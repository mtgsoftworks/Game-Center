import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Box, Typography, CircularProgress, List, ListItem, ListItemText, Button } from '@mui/material';
import { getTombalaLeaderboard } from '../../services/tombalaStatsService';
import { getUserTombalaAchievements } from '../../services/tombalaAchievementsService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
}

const TombalaStatsModal: React.FC<Props> = ({ open, onClose }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [leaderboard, setLeaderboard] = useState<Array<{ userId: string; name: string; score: number }>>([]);
  const [achievements, setAchievements] = useState<Array<{ id: string; title: string }>>([]);
  const [loadingLb, setLoadingLb] = useState(false);
  const [loadingAch, setLoadingAch] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  useEffect(() => {
    if (tab === 0) {
      setLoadingLb(true);
      getTombalaLeaderboard()
        .then(data => setLeaderboard(data))
        .catch(err => console.error('Leaderboard yüklemede hata:', err))
        .finally(() => setLoadingLb(false));
    } else if (currentUser) {
      setLoadingAch(true);
      getUserTombalaAchievements(currentUser.uid)
        .then(data => setAchievements(data.map(a => ({ id: a.id, title: a.title }))))
        .catch(err => console.error('Achievements yüklemede hata:', err))
        .finally(() => setLoadingAch(false));
    }
  }, [tab, currentUser]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('tombalaStatsModal.title', 'Tombala Liderlik ve Başarımlar')}</DialogTitle>
      <Tabs value={tab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
        <Tab label={t('tombalaStatsModal.leaderboard', 'Liderlik')} />
        <Tab label={t('tombalaStatsModal.achievements', 'Başarımlar')} />
      </Tabs>
      <DialogContent dividers>
        {tab === 0 && (
          loadingLb ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>
          ) : (
            <List>
              {leaderboard.map((u, i) => (
                <ListItem key={u.userId}>
                  <ListItemText
                    primary={`${i + 1}. ${u.name}`}
                    secondary={t('tombalaStatsModal.score', { score: u.score })}
                  />
                </ListItem>
              ))}
            </List>
          )
        )}
        {tab === 1 && (
          loadingAch ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>
          ) : (
            achievements.length > 0 ? (
              <List>
                {achievements.map(a => (
                  <ListItem key={a.id}><ListItemText primary={a.title} /></ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ mt: 2 }}>{t('tombalaStatsModal.noAchievements', 'Henüz başarımlarınız yok.')}</Typography>
            )
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate('/lobby')}>{t('tombalaStatsModal.replay', 'Yeniden Oyna')}</Button>
        <Button onClick={() => { navigator.clipboard.writeText(window.location.href); showNotification(t('tombalaStatsModal.shareCopied', 'Bağlantı kopyalandı'), 'success'); }}>
          {t('tombalaStatsModal.share', 'Sonuçları Paylaş')}
        </Button>
        <Button onClick={onClose}>{t('close', 'Kapat')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TombalaStatsModal; 