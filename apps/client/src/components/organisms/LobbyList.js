import React, { useContext, useState } from 'react';
import { Grid, Typography, Container, Box, CircularProgress } from '@mui/material';
import useToast from '../../hooks/useToast';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';
import { LobbyContext } from '../../contexts/LobbyContext';
import LobbyTabs from './LobbyTabs';
import LobbyCard from '../molecules/LobbyCard';

const LobbyList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { lobbies, loading, error, joinLobby, deleteLobby } = useContext(LobbyContext);
  const [filter, setFilter] = useState('all');

  const filtered = lobbies.filter(lobby =>
    filter === 'all' ||
    (filter === 'event' && lobby.type === 'event') ||
    (filter === 'locked' && lobby.password)
  );

  const handleJoin = async (id) => {
    try {
      await joinLobby(id);
      navigate(`/lobbies/${id}/chat`);
      toast(t('joinedLobby'), 'success');
    } catch (err) {
      toast(t('joinLobbyFailed') || t('updateFailed'), 'error');
    }
  };
  const handleDelete = async (id) => {
    try {
      await deleteLobby(id);
      toast(t('deletedSuccessfully'), 'info');
    } catch (err) {
      toast(t('lobbyUpdateFailed'), 'error');
    }
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">{t('lobbies')}</Typography>
        <Typography variant="subtitle1">
          {t('totalLobbies')}: <NumericFormat value={filtered.length} displayType="text" thousandSeparator />
        </Typography>
      </Box>
      <LobbyTabs value={filter} onChange={setFilter} />
      {loading ? (
        <Box display="flex" justifyContent="center" mt={2}><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error">{error.message || 'Lobiler yüklenirken hata oluştu.'}</Typography>
      ) : (
        <Grid container spacing={2} mt={2}>
          {filtered.map(lobby => (
            <Grid item xs={12} sm={6} md={4} key={lobby._id}>
              <LobbyCard
                lobby={lobby}
                onJoin={() => handleJoin(lobby._id)}
                onEdit={() => navigate(`/lobbies/${lobby._id}/edit`)}
                onDelete={() => handleDelete(lobby._id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default LobbyList; 