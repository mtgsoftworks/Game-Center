import React, { useEffect, useState } from 'react';
import { Typography, Container, Button } from '@mui/material';
import MaterialTable from 'react-material-table';
import { getLobbies, deleteLobby } from '../services/lobbyService';

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
    console.log('Edit lobby', lobby._id);
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
      <MaterialTable
        title="Lobi Yönetimi"
        columns={[
          { title: 'İsim', field: 'name' },
          { title: 'Tip', field: 'type' }
        ]}
        data={lobbies}
        actions={[
          {
            icon: 'edit',
            tooltip: 'Düzenle',
            onClick: (event, rowData) => handleEdit(rowData)
          },
          {
            icon: 'delete',
            tooltip: 'Sil',
            onClick: (event, rowData) => handleDelete(rowData._id)
          }
        ]}
        options={{ actionsColumnIndex: -1 }}
      />
    </Container>
  );
}

export default LobbyManagementPage;