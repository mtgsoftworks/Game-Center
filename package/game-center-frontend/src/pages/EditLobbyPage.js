/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Container,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { getLobby, updateLobby } from '../services/lobbyService';
import { getGames } from '../services/gameService';

function EditLobbyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState('');
  const [type, setType] = useState('normal');
  const [password, setPassword] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [gamesList, setGamesList] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lobby = await getLobby(id);
        setName(lobby.name);
        setType(lobby.type);
        setIsPasswordProtected(!!lobby.password);
        setPassword(lobby.password || '');
        setSelectedGame(lobby.gameId || '');
        if (lobby.startDate) setStartDate(new Date(lobby.startDate));
        if (lobby.endDate) setEndDate(new Date(lobby.endDate));
      } catch (error) {
        console.error('Fetch lobby error:', error);
        setSubmitError(t('lobbyUpdateFailed'));
      }
    };
    fetchData();
    const fetchGamesData = async () => {
      const games = await getGames();
      setGamesList(games);
    };
    fetchGamesData();
  }, [id, t]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateLobby(id, {
        name,
        type,
        password: isPasswordProtected ? password : null,
        gameId: selectedGame,
        ...(type === 'event' && { startDate, endDate })
      });
      navigate('/home');
    } catch (error) {
      console.error('Update lobby error:', error);
      setSubmitError(t('lobbyUpdateFailed'));
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" mt={5}>
        {t('updateLobby')}
      </Typography>
      {submitError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {submitError}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label={t('lobbyName')}
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="lobby-type-label">{t('lobbyType')}</InputLabel>
          <Select
            labelId="lobby-type-label"
            value={type}
            onChange={e => setType(e.target.value)}
            label={t('lobbyType')}
          >
            <MenuItem value="event">{t('event')}</MenuItem>
            <MenuItem value="normal">{t('normal')}</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={isPasswordProtected}
              onChange={e => setIsPasswordProtected(e.target.checked)}
            />
          }
          label={t('passwordProtect')}
        />
        {isPasswordProtected && (
          <TextField
            label={t('lobbyPassword')}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        )}
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="game-select-label">{t('availableGames')}</InputLabel>
          <Select
            labelId="game-select-label"
            value={selectedGame}
            onChange={e => setSelectedGame(e.target.value)}
            label={t('availableGames')}
          >
            {gamesList.map(game => (
              <MenuItem key={game.id} value={game.id}>
                {game.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {type === 'event' && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label={t('eventStart')}
              value={startDate}
              onChange={newValue => setStartDate(newValue)}
              renderInput={params => (
                <TextField {...params} fullWidth margin="normal" required />
              )}
            />
            <DateTimePicker
              label={t('eventEnd')}
              value={endDate}
              onChange={newValue => setEndDate(newValue)}
              renderInput={params => (
                <TextField {...params} fullWidth margin="normal" required />
              )}
            />
          </LocalizationProvider>
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 2 }}>
          {t('updateLobby')}
        </Button>
        <Button variant="outlined" fullWidth size="large" sx={{ mt: 2 }} onClick={() => navigate('/home')}>
          {t('cancel')}
        </Button>
      </form>
    </Container>
  );
}

export default EditLobbyPage;
/* eslint-enable react/jsx-props-no-spreading */
