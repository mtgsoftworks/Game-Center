import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import ListItemButton from '@mui/material/ListItemButton';

// Interface for Room data
interface WaitingRoom extends DocumentData {
    id: string;
    creatorName: string;
    creatorUid: string;
    createdAt: Timestamp;
    roomName?: string;
    maxPlayers?: number;
}

const MainLobby: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [roomCodeToJoin, setRoomCodeToJoin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [waitingRooms, setWaitingRooms] = useState<WaitingRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [newMaxPlayers, setNewMaxPlayers] = useState<number>(2);

  // --- Fetch Waiting Rooms --- 
  useEffect(() => {
    setLoadingRooms(true);
    const roomsQuery = query(
      collection(db, 'gameRooms'),
      where('status', '==', 'waiting')
    );

    const unsubscribe = onSnapshot(roomsQuery, (querySnapshot) => {
      const rooms: WaitingRoom[] = [];
      querySnapshot.forEach((doc) => {
        rooms.push({ id: doc.id, ...doc.data() } as WaitingRoom);
      });
      // Sort rooms by creation time, newest first
      rooms.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setWaitingRooms(rooms);
      setLoadingRooms(false);
    }, (err) => {
        console.error("Error fetching waiting rooms:", err);
        setError(t("errorLoadRooms"));
        showNotification(t("errorLoadRooms"), "error");
        setLoadingRooms(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [showNotification, t]);


  const handleLogout = async () => {
    try {
      await auth.signOut();
      showNotification(t('loggedOut'), 'info');
      navigate('/login');
    } catch (error) {
      console.error('Logout Error:', error);
      setError(t('errorFailedLogout'));
      showNotification(t('errorFailedLogout'), 'error');
    }
  };

  const handleOpenCreateDialog = () => {
    setNewRoomName('');
    setCreateError(null);
    setNewMaxPlayers(2);
    setOpenCreateDialog(true);
    setError(null);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleConfirmCreateGame = async () => {
    if (!currentUser) return setCreateError(t('You must be logged in to create a game.'));
    if (!newRoomName.trim()) return setCreateError(t('lobby.errorRoomNameEmpty'));
    setCreateError(null);

    try {
      const docRef = await addDoc(collection(db, 'gameRooms'), {
        creatorUid: currentUser.uid,
        creatorName: currentUser.displayName || 'Anonymous Creator',
        roomName: newRoomName.trim(),
        maxPlayers: newMaxPlayers,
        status: 'waiting',
        createdAt: serverTimestamp(),
        readyP1: true,  // Host auto-ready
        readyP2: false,
        readyP3: false,
        readyP4: false,
      });
      console.log('Game room created with ID:', docRef.id, 'and Name:', newRoomName.trim());
      showNotification(t('roomCreated', { id: newRoomName.trim() }), 'success');
      handleCloseCreateDialog();
      navigate(`/game/${docRef.id}`);
    } catch (e) {
      console.error('Error creating game room:', e);
      setCreateError(t('errorFailedToCreate'));
      showNotification(t('errorFailedToCreate'), 'error');
    }
  };

  const handleOpenJoinDialog = () => {
    setRoomCodeToJoin('');
    setOpenJoinDialog(true);
    setError(null);
  };

  const handleCloseJoinDialog = () => {
    setOpenJoinDialog(false);
  };

  const handleConfirmJoinGame = async () => {
    if (!currentUser) return setError(t('You must be logged in to join a game.'));
    if (!roomCodeToJoin.trim()) return setError(t('Please enter a room code.'));
    setError(null);
    const roomId = roomCodeToJoin.trim();
    const roomRef = doc(db, 'gameRooms', roomId);

    try {
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        setError(t('roomNotFound'));
        return;
      }
      const roomData = roomSnap.data() as WaitingRoom;
      if (roomData.status !== 'waiting') {
        setError(t('roomNotAvailable'));
        return;
      }
      if (roomData.creatorUid === currentUser.uid) {
        setError(t('cannotJoinOwnGame'));
        setTimeout(() => navigate(`/game/${roomId}`), 2000);
        return;
      }
      // Dynamic join for 2-4 players
      const { maxPlayers = 2, player2Uid, player3Uid, player4Uid } = roomData;
      let slotsCount = 1;
      if (player2Uid) slotsCount++;
      if (player3Uid) slotsCount++;
      if (player4Uid) slotsCount++;
      if (slotsCount >= maxPlayers) {
        setError(t('roomFull'));
        return;
      }
      const nextSlot = !player2Uid ? 2 : !player3Uid ? 3 : 4;
      const uidField = `player${nextSlot}Uid`;
      const nameField = `player${nextSlot}Name`;
      const updatePayload: Record<string, string | boolean> = {
        [uidField]: currentUser.uid,
        [nameField]: currentUser.displayName || `Anonymous Player ${nextSlot}`
      };
      if (slotsCount + 1 === maxPlayers) {
        updatePayload.status = 'ready';
      }
      await updateDoc(roomRef, updatePayload);
      console.log(`Player ${currentUser.displayName} joined room: ${roomId} as Player ${nextSlot}`);
      showNotification(t('joinedRoom', { id: roomId }), 'success');
      handleCloseJoinDialog();
      navigate(`/game/${roomId}`);
    } catch (e) {
      console.error('Error joining game room:', e);
      setError(t('errorFailedToJoin'));
      showNotification(t('errorFailedToJoin'), 'error');
    }
  };

   // Function to delete a room
   const handleDeleteRoom = async (roomIdToDelete: string) => {
        if (!currentUser) return;
        // Optional: Add a confirmation dialog here
        const roomToDelete = waitingRooms.find(room => room.id === roomIdToDelete);
        if (roomToDelete?.creatorUid !== currentUser.uid) {
            showNotification(t("deleteRoomConfirm"), "warning");
            return;
        }

        const roomRef = doc(db, 'gameRooms', roomIdToDelete);
        try {
            await deleteDoc(roomRef);
            showNotification(t('roomDeleted', { id: roomIdToDelete }), 'info');
            // The onSnapshot listener will automatically update the list
        } catch (error) {
            console.error("Error deleting room:", error);
            showNotification(t("errorFailedToDelete"), "error");
        }
    };


  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('lobbyTitle')}
        </Typography>
        {currentUser && (
          <Typography variant="h6" gutterBottom>
            {t('welcome', { name: currentUser.displayName || 'User' })}
          </Typography>
        )}
        {error && !openJoinDialog && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ my: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleOpenCreateDialog}>
            {t('createNewGame')}
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => handleOpenJoinDialog()}>
            {t('joinGameCode')}
          </Button>
        </Box>

        {/* List of Waiting Rooms */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>{t('availableGames')}</Typography>
        <Paper elevation={2} sx={{ width: '100%', p: 2 }}>
            {loadingRooms ? (
                <Box sx={{display: 'flex', justifyContent: 'center', my: 3}}><CircularProgress /></Box>
            ) : waitingRooms.length === 0 ? (
                <Typography sx={{textAlign: 'center', my: 3}}>{t('noWaitingRooms')}</Typography>
            ) : (
                <List>
                    {waitingRooms.map((room, index) => (
                        <React.Fragment key={room.id}>
                            <ListItem disablePadding secondaryAction={
                              currentUser && room.creatorUid === currentUser.uid ? (
                                <>
                                  <IconButton edge="end" aria-label="copy" onClick={async e => { e.stopPropagation(); await navigator.clipboard.writeText(room.id); showNotification(t('lobby.copied'), 'success'); }}>
                                    <ContentCopyIcon />
                                  </IconButton>
                                  <IconButton edge="end" aria-label="delete" onClick={e => { e.stopPropagation(); handleDeleteRoom(room.id); }}>
                                    <DeleteIcon />
                                  </IconButton>
                                </>
                              ) : null
                            }>
                              <ListItemButton onClick={() => handleOpenJoinDialog()}>
                                <ListItemText
                                  primary={room.roomName ? t('lobby.roomNameDisplay', { name: room.roomName }) : t('lobby.roomByIdDisplay', { id: room.id })}
                                  secondary={t('createdBy', { name: room.creatorName })}
                                />
                              </ListItemButton>
                            </ListItem>
                            {index < waitingRooms.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            )}
        </Paper>


        <Button sx={{ mt: 5 }} onClick={handleLogout} color="error">
          {t('logoutButton')}
        </Button>
      </Box>

      {/* Dialog for Joining a Game by Code */}
      <Dialog open={openJoinDialog} onClose={handleCloseJoinDialog}>
        <DialogTitle>{t('joinRoomTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('joinRoomPrompt')}
          </DialogContentText>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="roomCode"
            label={t('roomCodeLabel')}
            type="text"
            fullWidth
            variant="standard"
            value={roomCodeToJoin}
            onChange={(e) => setRoomCodeToJoin(e.target.value)}
            helperText={roomCodeToJoin ? "Press Join to enter this room." : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJoinDialog}>{t('cancelButton')}</Button>
          <Button onClick={handleConfirmJoinGame} variant="contained" disabled={!roomCodeToJoin.trim()}>
            {t('joinButton')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Creating a New Game */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>{t('lobby.createRoomDialogTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('lobby.enterRoomNamePlaceholder')}
          </DialogContentText>
          {createError && (
            <Typography color="error" sx={{ mb: 1 }}>{createError}</Typography>
          )}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="max-players-label">{t('lobby.selectPlayerCount')}</InputLabel>
            <Select
              labelId="max-players-label"
              value={newMaxPlayers}
              label={t('lobby.selectPlayerCount')}
              onChange={e => setNewMaxPlayers(Number(e.target.value))}
            >
              <MenuItem value={2}>2 {t('lobby.players')}</MenuItem>
              <MenuItem value={3}>3 {t('lobby.players')}</MenuItem>
              <MenuItem value={4}>4 {t('lobby.players')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            id="roomName"
            label={t('lobby.roomNameLabel')}
            type="text"
            fullWidth
            variant="standard"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            error={!!createError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleConfirmCreateGame}>{t('lobby.createButton')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MainLobby; 