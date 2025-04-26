// src/pages/LobbyManagementPage.js
import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { getLobbies, updateLobby, deleteLobby } from '../services/lobbyService';

function LobbyManagementPage() {
  const [lobbies, setLobbies] = useState([]);

  useEffect(() => {
    fetchLobbies();
  }, []);

  const fetchLobbies = async () => {
    try {
      const data = await getLobbies();
      setLobbies(data);
    } catch (error) {
      console.error('Lobileri getirme hatası:', error);
    }
  };

  const handleEdit = (lobby) => {
    // Lobi güncelleme işlemleri
  };

  const handleDelete = async (lobbyId) => {
    try {
      await deleteLobby(lobbyId);
      fetchLobbies();
    } catch (error) {
      console.error('Lobi silme hatası:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" mt={5}>Lobi Yönetimi</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>İsim</TableCell>
            <TableCell>Tip</TableCell>
            <TableCell>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lobbies.map((lobby) => (
            <TableRow key={lobby._id}>
              <TableCell>{lobby.name}</TableCell>
              <TableCell>{lobby.type}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(lobby)}>Düzenle</Button>
                <Button onClick={() => handleDelete(lobby._id)}>Sil</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default LobbyManagementPage;