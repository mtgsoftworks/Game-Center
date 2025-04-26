// src/components/LobbyListItem.js

import React, { useState } from 'react';
import { Button, Dialog, TextField, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { joinLobby } from '../services/lobbyService';

function LobbyListItem({ lobby }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');

  const handleJoin = async () => {
    try {
      await joinLobby(lobby._id, password);
      // Başarılıysa, lobiye katılım işlemleri
    } catch (error) {
      console.error('Lobiye katılma hatası:', error);
      alert(error.response.data.message || 'Lobiye katılamadınız.');
    }
    setOpen(false);
  };

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Katıl
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Lobiye Katıl</DialogTitle>
        <DialogContent>
          {lobby.password && (
            <TextField
              label="Lobi Şifresi"
              type="password"
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>İptal</Button>
          <Button onClick={handleJoin} color="primary">
            Katıl
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default LobbyListItem;