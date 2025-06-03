/**
 * src/components/Lobby/MainLobby.tsx: Oyun lobisi ana bileşeni.
 * Kullanıcıların yeni oyun odası oluşturmasını, mevcut odalara katılmasını ve odaları yönetmesini sağlar.
 * Firestore üzerinden gerçek zamanlı oda verisi dinler. Kullanıcıya bildirim ve hata yönetimi sunar.
 * Çoklu dil desteği ve Material UI ile modern arayüz sağlar.
 *
 * @returns {JSX.Element} Oyun lobisi arayüzü.
 */
import React, { useState, useEffect } from 'react'; // React: JSX desteği, useState: state yönetimi, useEffect: yan etkileri yönetmek için Hook'lar
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
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Divider
} from '@mui/material'; // Material UI bileşenleri: arayüz öğeleri için
import { useAuth } from '../../contexts/AuthContext'; // useAuth: kimlik doğrulama durumunu almak için özel Hook
import { useNotification } from '../../contexts/NotificationContext'; // useNotification: bildirim göstermek için Hook
import { useNavigate } from 'react-router-dom'; // useNavigate: sayfa yönlendirmeleri için React Router Hook
import { auth, db } from '../../services/firebase'; // auth, db: Firebase Authentication ve Firestore veritabanı nesneleri
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  Timestamp,
  DocumentData,
  UpdateData
} from 'firebase/firestore'; // Firebase Firestore işlemleri: veri okuma/yazma için fonksiyonlar
import { useTranslation } from 'react-i18next'; // useTranslation: çoklu dil desteği için çeviri Hook
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useWaitingRooms } from '../../hooks/useWaitingRooms';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LoginIcon from '@mui/icons-material/Login';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete'; // DeleteIcon: silme iconu
import EditIcon from '@mui/icons-material/Edit'; // EditIcon: düzenleme iconu
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // ContentCopyIcon: kopyalama iconu
import FacebookIcon from '@mui/icons-material/Facebook'; // Facebook paylaşım
import TwitterIcon from '@mui/icons-material/Twitter'; // Twitter paylaşım
import WhatsAppIcon from '@mui/icons-material/WhatsApp'; // WhatsApp paylaşım
import TelegramIcon from '@mui/icons-material/Telegram'; // Telegram paylaşım

// Interface for Room data
interface WaitingRoom extends DocumentData {
  // WaitingRoom: lobide bekleyen oyun odası bilgilerini tutan veri yapısı
  id: string;
  creatorName: string;
  creatorUid: string;
  createdAt: Timestamp;
  roomName?: string;
  maxPlayers?: number;
  type?: 'normal' | 'event';
  password?: string;
  startTime?: Timestamp;
  endTime?: Timestamp;
  creatorLeftAt?: Timestamp;
  status: 'waiting' | 'closed';
}

const MainLobby: React.FC = () => {
  // useTranslation ile UI metinlerini çevir
  const { t } = useTranslation();
  // useAuth ile mevcut kullanıcı bilgilerini al
  const { currentUser } = useAuth();
  // useNotification ile kullanıcıya bildirim göster
  const { showNotification } = useNotification();
  // useNavigate ile sayfa yönlendirmeleri yap
  const navigate = useNavigate();
  // State: bekleyen odalar listesini ve yüklenme durumunu tutar
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [roomCodeToJoin, setRoomCodeToJoin] = useState('');
  const [joinPassword, setJoinPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [newMaxPlayers, setNewMaxPlayers] = useState<number>(2);
  // Yeni eklenen lobi özellikleri
  const [newRoomType, setNewRoomType] = useState<'normal' | 'event'>('normal');
  const [newStartDateTime, setNewStartDateTime] = useState<string>('');
  const [newEndDateTime, setNewEndDateTime] = useState<string>('');
  const [newRoomPassword, setNewRoomPassword] = useState<string>('');
  // Snackbar için state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [now, setNow] = useState<number>(Date.now());
  // Firestore'dan bekleyen odalar
  const { rooms: waitingRooms, loading: loadingRooms, error: roomsError } = useWaitingRooms();
  useEffect(() => {
    if (roomsError) {
      showNotification(t('errorLoadRooms'), 'error');
    }
  }, [roomsError, showNotification, t]);
  // Kullanıcının zaten bir lobisi var mı?
  const hasOwnRoom = currentUser ? waitingRooms.some(room => room.creatorUid === currentUser.uid) : false;
  // Oluşturulan lobi kodunu sakla ve onay dialog'u için kontrol et
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [showCreatedDialog, setShowCreatedDialog] = useState<boolean>(false);
  // Düzenleme dialogu için state
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  // Etkinlik lobisi detayını hesaplama
  const getEventDetail = (room: WaitingRoom): string => {
    const startMs = room.startTime?.toMillis() ?? 0;
    const endMs = room.endTime?.toMillis() ?? 0;
    if (now < startMs) {
      const diff = startMs - now;
      if (diff > 24 * 3600 * 1000) {
        return `Başlangıç: ${new Date(startMs).toLocaleString()}`;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return `Başlayacak: ${h}h ${m}m ${s}s`;
    }
    if (now < endMs) {
      const diff = endMs - now;
      if (diff > 24 * 3600 * 1000) {
        return `Bitiş: ${new Date(endMs).toLocaleString()}`;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return `Kalan: ${h}h ${m}m ${s}s`;
    }
    return 'Etkinlik sona erdi';
  };

  const handleLogout = async () => {
    // Kullanıcı çıkış işlemi
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
    // Yeni oyun odası oluşturma
    if (!currentUser) return setCreateError(t('You must be logged in to create a game.'));
    if (!newRoomName.trim()) return setCreateError(t('lobby.errorRoomNameEmpty'));
    setCreateError(null);
    // Form validasyonları
    if (newRoomType === 'event') {
      if (!newStartDateTime || !newEndDateTime) {
        return setCreateError(t('lobby.errorDateRequired'));
      }
      if (new Date(newStartDateTime) >= new Date(newEndDateTime)) {
        return setCreateError(t('lobby.errorDateRange'));
      }
    }
    if (newRoomPassword && newRoomPassword.length < 4) {
      return setCreateError(t('lobby.errorPasswordLength'));
    }

    try {
      const createPayload: Partial<WaitingRoom> = {
        creatorUid: currentUser.uid,
        creatorName: currentUser.displayName || 'Anonymous Creator',
        roomName: newRoomName.trim(),
        maxPlayers: newMaxPlayers,
        status: 'waiting',
        createdAt: Timestamp.fromDate(new Date()),
        readyP1: true,
        readyP2: false,
        readyP3: false,
        readyP4: false,
        type: newRoomType,
        password: newRoomPassword
      };
      if (newRoomType === 'event') {
        createPayload.startTime = Timestamp.fromDate(new Date(newStartDateTime));
        createPayload.endTime = Timestamp.fromDate(new Date(newEndDateTime));
      }
      const docRef = await addDoc(collection(db, 'gameRooms'), createPayload);
      console.log('Game room created with ID:', docRef.id);
      showNotification(t('roomCreated', { id: docRef.id }), 'success');
      handleCloseCreateDialog();
      setCreatedRoomCode(docRef.id);
      setShowCreatedDialog(true);
    } catch (e) {
      console.error('Error creating game room:', e);
      setCreateError(t('errorFailedToCreate'));
      showNotification(t('errorFailedToCreate'), 'error');
    }
  };

  const handleOpenJoinDialog = () => {
    setRoomCodeToJoin('');
    setJoinPassword('');
    setOpenJoinDialog(true);
    setError(null);
  };

  const handleCloseJoinDialog = () => {
    setOpenJoinDialog(false);
  };

  const handleConfirmJoinGame = async () => {
    // Koda göre mevcut oyuna katılma işlemi
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
      // Şifre korumalı lobi için kontrol
      if (roomData.password) {
        if (roomData.password !== joinPassword) {
          setError(t('lobby.errorWrongPassword'));
          return;
        }
      }
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
    // Kullanıcı çıkış işlemi
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

  // Lobileri filtrele ve sırala: süresi geçmişleri gizle, etkinlik önde
  const displayRooms = waitingRooms
    .filter(room => {
      if (room.type === 'normal') {
        if (room.creatorLeftAt) {
          return now < room.creatorLeftAt.toMillis() + 8 * 3600 * 1000;
        }
        return true;
      }
      if (room.type === 'event') {
        return room.endTime ? now < room.endTime.toMillis() : false;
      }
      return false;
    })
    .sort((a, b) => {
      if (a.type === 'event' && b.type !== 'event') return -1;
      if (a.type !== 'event' && b.type === 'event') return 1;
      if (a.type === 'event' && b.type === 'event') {
        const aStart = a.startTime?.toMillis() ?? 0;
        const bStart = b.startTime?.toMillis() ?? 0;
        return aStart - bStart;
      }
      const aCreated = a.createdAt?.toMillis() ?? 0;
      const bCreated = b.createdAt?.toMillis() ?? 0;
      return bCreated - aCreated;
    });

  // Düzenleme dialogunu aç
  const handleOpenEditDialog = (room: WaitingRoom) => {
    setEditRoomId(room.id);
    setNewRoomName(room.roomName ?? '');
    setNewMaxPlayers(room.maxPlayers ?? 2);
    setNewRoomType(room.type ?? 'normal');
    setNewStartDateTime(room.startTime ? room.startTime.toDate().toISOString() : '');
    setNewEndDateTime(room.endTime ? room.endTime.toDate().toISOString() : '');
    setNewRoomPassword(room.password ?? '');
    setOpenEditDialog(true);
    setCreateError(null);
    setError(null);
  };

  // Düzenleme dialogunu kapat
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditRoomId(null);
  };

  // Düzenlenen lobi verilerini kaydet
  const handleConfirmEditGame = async () => {
    if (!currentUser || !editRoomId) return;
    if (!newRoomName.trim()) return setCreateError(t('lobby.errorRoomNameEmpty'));
    const roomRef = doc(db, 'gameRooms', editRoomId);
    const updatePayload: UpdateData<WaitingRoom> = {
      roomName: newRoomName.trim(),
      maxPlayers: newMaxPlayers,
      type: newRoomType,
      password: newRoomPassword
    };
    if (newRoomType === 'event') {
      updatePayload.startTime = Timestamp.fromDate(new Date(newStartDateTime));
      updatePayload.endTime = Timestamp.fromDate(new Date(newEndDateTime));
    } else {
      updatePayload.startTime = deleteField();
      updatePayload.endTime = deleteField();
    }
    // Form validasyonları
    if (newRoomType === 'event') {
      if (!newStartDateTime || !newEndDateTime) {
        setCreateError(t('lobby.errorDateRequired'));
        return;
      }
      if (new Date(newStartDateTime) >= new Date(newEndDateTime)) {
        setCreateError(t('lobby.errorDateRange'));
        return;
      }
    }
    if (newRoomPassword && newRoomPassword.length < 4) {
      setCreateError(t('lobby.errorPasswordLength'));
      return;
    }
    try {
      await updateDoc(roomRef, updatePayload);
      showNotification(t('lobby.updateSuccess'), 'success');
      handleCloseEditDialog();
    } catch (e) {
      console.error('Error updating game room:', e);
      showNotification(t('errorFailedToUpdate'), 'error');
    }
  };

  // Bileşenin render ettiği JSX: odalar listesi, dialoglar ve butonlar
  return (
    // Lobinin ana konteyneri: başlık, mesaj, butonlar ve odalar listesi
    <Container maxWidth="md">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Lobinin başlığı */}
        <Typography variant="h4" component="h1" gutterBottom>
          {t('lobbyTitle')}
        </Typography>
        {/* Eğer giriş yapılmışsa hoşgeldiniz mesajı göster */}
        {currentUser && (
          <Typography variant="h6" gutterBottom>
            {t('welcome', { name: currentUser.displayName || 'User' })}
          </Typography>
        )}
        {/* Hata varsa ve join dialog değilse hata mesajı göster */}
        {error && !openJoinDialog && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {/* Oyun oluşturma ve kodla katılma butonları */}
        <Box sx={{ my: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleIcon />}
            size="large"
            sx={{ borderRadius: 2 }}
            aria-label={t('createNewGame')}
            onClick={handleOpenCreateDialog}
            disabled={hasOwnRoom}
          >
            {t('createNewGame')}
          </Button>
          {hasOwnRoom && (
            <Typography variant="body2" color="error" sx={{ alignSelf: 'center' }}>
              {t('lobby.oneLobbyRule')}
            </Typography>
          )}
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<LoginIcon />}
            size="large"
            sx={{ borderRadius: 2 }}
            aria-label={t('joinGameCode')}
            onClick={handleOpenJoinDialog}
          >
            {t('joinGameCode')}
          </Button>
        </Box>

        {/* Bekleyen odalar başlığı */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>{t('availableGames')}</Typography>
        <Paper elevation={2} sx={{ width: '100%', p: 2 }}>
          {loadingRooms ? (
            <Box sx={{display: 'flex', justifyContent: 'center', my: 3}}><CircularProgress /></Box>
          ) : displayRooms.length === 0 ? (
            <Typography sx={{textAlign: 'center', my: 3}}>{t('noWaitingRooms')}</Typography>
          ) : (
            <List>
              {displayRooms.map((room, index) => (
                <React.Fragment key={room.id}>
                  <ListItem disablePadding secondaryAction={
                    currentUser && room.creatorUid === currentUser.uid ? (
                      <>
                        <IconButton edge="end" aria-label="edit" onClick={e => { e.stopPropagation(); handleOpenEditDialog(room); }}>
                          <EditIcon />
                        </IconButton>
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
                        secondary={
                          <>
                            {t('createdBy', { name: room.creatorName })}
                            {room.type === 'event' && (
                              <Typography variant="caption" display="block">
                                {getEventDetail(room)}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < displayRooms.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Dialog for Joining a Game by Code */}
        <Dialog open={openJoinDialog} onClose={handleCloseJoinDialog} fullWidth maxWidth="xs">
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
              variant="outlined"
              value={roomCodeToJoin}
              onChange={(e) => setRoomCodeToJoin(e.target.value)}
              helperText={roomCodeToJoin ? "" : t('lobby.passwordOptional')}
            />
            <TextField
              margin="dense"
              id="roomPassword"
              label={t('lobby.passwordLabel')}
              type="password"
              fullWidth
              variant="outlined"
              value={joinPassword}
              onChange={e => setJoinPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseJoinDialog}
              size="large"
              variant="outlined"
              startIcon={<CancelIcon />}
              aria-label={t('cancelButton')}
              sx={{ borderRadius: 2 }}
            >
              {t('cancelButton')}
            </Button>
            <Button onClick={handleConfirmJoinGame} variant="contained" size="large" sx={{ borderRadius: 2 }} disabled={!roomCodeToJoin.trim()}>
              {t('joinButton')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for Creating a New Game */}
        <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="sm">
          <DialogTitle>{t('lobby.createRoomDialogTitle')}</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {t('lobby.enterRoomNamePlaceholder')}
            </DialogContentText>
            {createError && <Typography color="error" sx={{ mb: 1 }}>{createError}</Typography>}
            <Stack spacing={2}>
              <FormControl fullWidth>
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
                margin="dense"
                label={t('lobby.passwordLabel')}
                type="password"
                fullWidth
                variant="outlined"
                value={newRoomPassword}
                onChange={e => setNewRoomPassword(e.target.value)}
              />
              <TextField
                autoFocus
                margin="dense"
                label={t('lobby.roomNameLabel')}
                type="text"
                fullWidth
                variant="outlined"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                error={!!createError}
              />
              <FormControl component="fieldset">
                <RadioGroup row value={newRoomType} onChange={e => setNewRoomType(e.target.value as 'normal' | 'event')}>
                  <FormControlLabel value="normal" control={<Radio />} label={t('lobby.normal')} />
                  <FormControlLabel value="event" control={<Radio />} label={t('lobby.event')} />
                </RadioGroup>
              </FormControl>
              {newRoomType === 'event' && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label={t('lobby.startDateTime')}
                      value={newStartDateTime ? new Date(newStartDateTime) : null}
                      onChange={val => setNewStartDateTime(val ? val.toISOString() : '')}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label={t('lobby.endDateTime')}
                      value={newEndDateTime ? new Date(newEndDateTime) : null}
                      onChange={val => setNewEndDateTime(val ? val.toISOString() : '')}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Stack>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateDialog} size="large" sx={{ borderRadius: 2 }} variant="outlined">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirmCreateGame} size="large" sx={{ borderRadius: 2 }} variant="contained">
              {t('lobby.createButton')}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Oluşturma Sonrası Onay Paneli */}
        <Dialog open={showCreatedDialog} onClose={() => setShowCreatedDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>{t('lobby.createdTitle')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('lobby.createdMessage', { code: createdRoomCode })}
            </DialogContentText>
            {/* Oda Kodu ve Şifre Alanları */}
            <TextField
              label={t('lobby.roomCodeLabel')}
              value={createdRoomCode || ''}
              InputProps={{ readOnly: true }}
              fullWidth
              variant="outlined"
              margin="dense"
            />
            {newRoomPassword && (
              <TextField
                label={t('lobby.passwordLabel')}
                value={newRoomPassword}
                InputProps={{ readOnly: true }}
                fullWidth
                variant="outlined"
                margin="dense"
                sx={{ mt: 2 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              const textToCopy = `Oda Kodu: ${createdRoomCode}` + (newRoomPassword ? `\nŞifre: ${newRoomPassword}` : '');
              navigator.clipboard.writeText(textToCopy);
              setSnackbarMessage(t('common.copySuccess'));
              setSnackbarSeverity('success');
              setSnackbarOpen(true);
            }}>
              {t('common.copy')}
            </Button>
            <Button onClick={() => { setShowCreatedDialog(false); navigate(`/game/${createdRoomCode}`); }}>
              {t('lobby.enterNow')}
            </Button>
            {/* Sosyal Paylaşım: Oda Kodu ve Şifre */}
            <IconButton onClick={() => {
              const text = encodeURIComponent(`Oda Kodu: ${createdRoomCode}` + (newRoomPassword ? `\nŞifre: ${newRoomPassword}` : ''));
              window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
            }}>
              <FacebookIcon />
            </IconButton>
            <IconButton onClick={() => {
              const text = encodeURIComponent(`Oda Kodu: ${createdRoomCode}` + (newRoomPassword ? `\nŞifre: ${newRoomPassword}` : ''));
              window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
            }}>
              <TwitterIcon />
            </IconButton>
            <IconButton onClick={() => {
              const text = encodeURIComponent(`Oda Kodu: ${createdRoomCode}` + (newRoomPassword ? `\nŞifre: ${newRoomPassword}` : ''));
              window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
            }}>
              <WhatsAppIcon />
            </IconButton>
            <IconButton onClick={() => {
              const text = encodeURIComponent(`Oda Kodu: ${createdRoomCode}` + (newRoomPassword ? `\nŞifre: ${newRoomPassword}` : ''));
              window.open(`https://t.me/share/url?text=${text}`, '_blank');
            }}>
              <TelegramIcon />
            </IconButton>
          </DialogActions>
        </Dialog>
        {/* Lobi Düzenleme Dialogu */}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
          <DialogTitle>{t('lobby.editRoomDialogTitle')}</DialogTitle>
          <DialogContent>
            <DialogContentText>{t('lobby.editRoomInstruction')}</DialogContentText>
            {createError && (
              <Typography color="error" sx={{ mb: 1 }}>
                {createError}
              </Typography>
            )}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="edit-max-players-label">{t('lobby.selectPlayerCount')}</InputLabel>
              <Select
                labelId="edit-max-players-label"
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
              id="edit-roomName"
              label={t('lobby.roomNameLabel')}
              type="text"
              fullWidth
              variant="standard"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              error={!!createError}
            />
            {/* Oda Tipi Seçimi */}
            <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
              <Typography component="legend">{t('lobby.selectType')}</Typography>
              <RadioGroup row value={newRoomType} onChange={e => setNewRoomType(e.target.value as 'normal' | 'event')}>
                <FormControlLabel value="normal" control={<Radio />} label={t('lobby.normal')} />
                <FormControlLabel value="event" control={<Radio />} label={t('lobby.event')} />
              </RadioGroup>
            </FormControl>
            {newRoomType === 'event' && (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label={t('lobby.startDateTime')}
                  value={newStartDateTime ? new Date(newStartDateTime) : null}
                  onChange={val => setNewStartDateTime(val ? val.toISOString() : '')}
                  slotProps={{ textField: { margin: 'dense', fullWidth: true, sx: { mt: 2 } } }}
                />
                <DateTimePicker
                  label={t('lobby.endDateTime')}
                  value={newEndDateTime ? new Date(newEndDateTime) : null}
                  onChange={val => setNewEndDateTime(val ? val.toISOString() : '')}
                  slotProps={{ textField: { margin: 'dense', fullWidth: true, sx: { mt: 2 } } }}
                />
              </LocalizationProvider>
            )}
            <TextField
              autoFocus
              margin="dense"
              id="edit-roomPassword"
              label={t('lobby.passwordLabel')}
              type="password"
              fullWidth
              variant="standard"
              value={newRoomPassword}
              onChange={e => setNewRoomPassword(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>{t('common.cancel')}</Button>
            <Button onClick={handleConfirmEditGame}>{t('common.save')}</Button>
          </DialogActions>
        </Dialog>
        {/* Global Snackbar */}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        {/* Global logout button styling */}
        <Button sx={{ mt: 5, borderRadius: 2 }} size="large" variant="outlined" color="error" onClick={handleLogout}>
          {t('logoutButton')}
        </Button>
      </Box>
    </Container>
  );
};

export default MainLobby;