// src/pages/GameDetailPage.js
/* eslint-disable react/jsx-props-no-spreading */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Container,
  CircularProgress
} from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// eslint-disable-next-line import/no-extraneous-dependencies
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { getLobbies, createLobby } from '../services/lobbyService';

const Lazy2048 = lazy(() => import('game-2048'));

function GameDetailPage() {
  const { gameId } = useParams();
  const { t } = useTranslation();
  const [lobbies, setLobbies] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('normal');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const all = await getLobbies();
        setLobbies(all.filter(l => l.gameId === gameId));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [gameId]);

  const handleCreateSubmit = async () => {
    try {
      const newLobby = await createLobby({
        name,
        type,
        password: isPasswordProtected ? password : null,
        gameId,
        ...(type === 'event' && { startDate, endDate })
      });
      setLobbies(prev => [...prev, newLobby]);
      setOpenCreate(false);
      setName(''); setType('normal'); setIsPasswordProtected(false);
      setPassword(''); setStartDate(new Date()); setEndDate(new Date());
    } catch (e) {
      console.error(e);
      setError(t('lobbyCreationFailed'));
    }
  };

  let GameComponent;
  if (gameId === '2048') {
    GameComponent = Lazy2048;
  } else {
    return <Typography variant="h6" align="center">{t('gameNotFound')}</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Suspense fallback={<CircularProgress />}>
        <GameComponent />
      </Suspense>
      {/* Lobby list and creation */}
      <Typography variant="h5" mt={4}>
        {t('lobbiesForGame')}
      </Typography>
      <List>
        {lobbies.map(lobby => (
          <ListItem key={lobby._id}>
            <ListItemText
              primary={lobby.name}
              secondary={lobby.type === 'event'
                ? `${t('startsAt')} ${new Date(lobby.startDate).toLocaleString()}`
                : ''}
            />
          </ListItem>
        ))}
      </List>
      <Button variant="contained" onClick={() => setOpenCreate(true)} sx={{ mt: 2 }}>
        {t('createLobby')}
      </Button>
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>{t('createLobby')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('lobbyName')}
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth margin="normal" required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="lobby-type-label">{t('lobbyType')}</InputLabel>
            <Select
              labelId="lobby-type-label"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <MenuItem value="event">{t('event')}</MenuItem>
              <MenuItem value="normal">{t('normal')}</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Checkbox checked={isPasswordProtected} onChange={e => setIsPasswordProtected(e.target.checked)} />} label={t('passwordProtect')}
          />
          {isPasswordProtected && (
            <TextField
              label={t('lobbyPassword')} type="password" value={password}
              onChange={e => setPassword(e.target.value)} fullWidth margin="normal" required
            />
          )}
          {type === 'event' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label={t('eventStart')} value={startDate}
                onChange={newValue => setStartDate(newValue)}
                renderInput={params => <TextField {...params} fullWidth margin="normal" required />} 
              />
              <DateTimePicker
                label={t('eventEnd')} value={endDate}
                onChange={newValue => setEndDate(newValue)}
                renderInput={params => <TextField {...params} fullWidth margin="normal" required />} 
              />
            </LocalizationProvider>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>{t('cancel')}</Button>
          <Button onClick={handleCreateSubmit}>{t('createLobby')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default GameDetailPage;