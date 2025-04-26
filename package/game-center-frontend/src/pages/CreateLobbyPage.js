import React, { useState } from 'react';
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
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { createLobby } from '../services/lobbyService';

function CreateLobbyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [type, setType] = useState('normal');
  const [password, setPassword] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      await createLobby({
        name,
        type,
        password: isPasswordProtected ? password : null,
      });
      // Başarılı oluşturma sonrası ana sayfaya yönlendir
      navigate('/');
    } catch (error) {
      console.error('Lobi oluşturma hatası:', error);
      setSubmitError(t('lobbyCreationFailed') || 'Lobi oluşturulamadı. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" mt={5}>
        {t('createLobby')}
      </Typography>
      {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
        >
          {t('createLobby')}
        </Button>
      </form>
    </Container>
  );
}

export default CreateLobbyPage;