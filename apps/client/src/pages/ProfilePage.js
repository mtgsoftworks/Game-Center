/**
 * src/pages/ProfilePage.js: Kullanıcı profil sayfası bileşeni.
 * Oturum açmış kullanıcının ad, e-posta bilgilerini gösterir; başarımlar ve istatistikler placeholder bileşenleri aracılığıyla sunulur.
 * useAuth hook'u ile erişim kontrolü sağlar.
 *
 * @returns {JSX.Element} Profil sayfası bileşeni.
 */
import React, { useContext, useState, useEffect } from 'react';
import { Typography, Container, Paper, Avatar, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Tabs, Tab, Grid, IconButton, Skeleton, LinearProgress, Accordion, AccordionSummary, AccordionDetails, FormGroup, FormControlLabel, Switch, InputLabel, Select, MenuItem, Alert, RadioGroup, Radio, FormLabel, FormControl as MUIFormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../contexts/UserContext';
import { AppContext } from '../contexts/AppContext';
import { updateProfile as updateProfileApi } from '../services/authService';
import auth, { db } from '../firebase';
import { updateProfile as updateAuthProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import useToast from '../hooks/useToast';
import { uploadAvatar } from '../services/storageService';
import { SettingsContext } from '../contexts/SettingsContext';
import PaletteIcon from '@mui/icons-material/Palette';
import LanguageIcon from '@mui/icons-material/Language';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { changePassword as changePasswordService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { deleteAccount as deleteAccountService } from '../services/authService';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const MAX_BIO_LENGTH = 150;

function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useContext(UserContext);
  const { state: appState, dispatch: appDispatch } = useContext(AppContext);
  const { settings, updateSetting } = useContext(SettingsContext);
  const toast = useToast();
  const navigate = useNavigate();
  const { currentTheme, toggleTheme } = useCustomTheme();

  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [nameEdit, setNameEdit] = useState('');
  const [bioEdit, setBioEdit] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Gizlilik Ayarları State'leri
  const [profileVisibility, setProfileVisibility] = useState('public'); // Varsayılan: public
  const [shareGameActivity, setShareGameActivity] = useState(true); // Varsayılan: true
  const [privacySettingsLoading, setPrivacySettingsLoading] = useState(false);

  // Email değişikliği state'leri
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');

  // Hesap silme state'leri
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [gameHistory, setGameHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      const fetchProfileData = async () => {
        setLoadingProfile(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setProfileData(data);
            setNameEdit(data.displayName || user.displayName || '');
            setBioEdit(data.bio || '');
            setProfileVisibility(data.profileVisibility || 'public');
            setShareGameActivity(typeof data.shareGameActivity === 'boolean' ? data.shareGameActivity : true);
          } else {
            const initialProfile = {
              displayName: user.displayName || '',
              email: user.email || '',
              photoURL: user.photoURL || null,
              bio: '',
              createdAt: user.metadata?.creationTime ? serverTimestamp() : null,
              level: 1,
              xp: 0,
            };
            await updateDoc(userDocRef, initialProfile, { merge: true });
            setProfileData(initialProfile);
            setNameEdit(initialProfile.displayName);
            setBioEdit(initialProfile.bio);
            setProfileVisibility(initialProfile.profileVisibility || 'public');
            setShareGameActivity(typeof initialProfile.shareGameActivity === 'boolean' ? initialProfile.shareGameActivity : true);
            console.log("Kullanıcı için Firestore'da profil belgesi oluşturuldu.");
          }
        } catch (error) {
          console.error("Profil verileri çekilirken/oluşturulurken hata:", error);
          toast(t('profilePage.errors.fetchError', 'Profil verileri yüklenirken bir hata oluştu.'), 'error');
        }
        setLoadingProfile(false);
      };
      fetchProfileData();
    }
  }, [user, t, toast]);

  useEffect(() => {
    if (user?.uid) {
      setLoadingHistory(true);
      const fetchHistory = async () => {
        try {
          const tombalaSnap = await getDocs(query(collection(db, 'tombalaStats'), where('userId', '==', user.uid), orderBy('playedAt', 'desc'), limit(10)));
          const tombalaHistory = tombalaSnap.docs.map(docSnap => ({ id: docSnap.id, date: docSnap.data().playedAt.toDate(), game: 'Tombala', score: docSnap.data().score, result: '-' }));
          const game2048Snap = await getDocs(query(collection(db, 'game2048Stats'), where('userId', '==', user.uid), orderBy('playedAt', 'desc'), limit(10)));
          const game2048History = game2048Snap.docs.map(docSnap => ({ id: docSnap.id, date: docSnap.data().playedAt.toDate(), game: '2048', score: docSnap.data().score, result: docSnap.data().success ? 'Kazandın' : 'Kaybettin' }));
          const combined = [...tombalaHistory, ...game2048History].sort((a, b) => b.date.getTime() - a.date.getTime());
          setGameHistory(combined);
        } catch (err) {
          console.error('Oyun geçmişi çekilemedi:', err);
        }
        setLoadingHistory(false);
      };
      fetchHistory();
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpenEditModal = () => {
    setNameEdit(profileData?.displayName || user?.displayName || '');
    setBioEdit(profileData?.bio || '');
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => setOpenEditModal(false);

  const handleEditSubmit = async () => {
    setLoadingEdit(true);
    try {
      const newName = nameEdit.trim();
      const newBio = bioEdit.trim();

      if (auth.currentUser && user?.uid) {
        if (auth.currentUser.displayName !== newName && newName) {
          await updateAuthProfile(auth.currentUser, { displayName: newName });
        }

        const userDocRef = doc(db, 'users', user.uid);
        const updateData = {
          displayName: newName,
          bio: newBio,
          updatedAt: serverTimestamp()
        };
        await updateDoc(userDocRef, updateData);
        
        const updatedUserForContext = { 
            ...user, 
            displayName: newName, 
        };
        setUser(updatedUserForContext);
        appDispatch({ type: 'SET_USER', payload: { user: updatedUserForContext, token: appState.auth.token } });
        setProfileData(prev => ({...prev, ...updateData, displayName: newName, bio: newBio }));

        toast(t('profilePage.success.profileUpdated', 'Profil başarıyla güncellendi'), 'success');
        handleCloseEditModal();
      }
    } catch (error) {
      console.error("Profil güncellenirken hata:", error);
      toast(t('profilePage.errors.updateError', 'Profil güncellenirken bir hata oluştu.'), 'error');
    }
    setLoadingEdit(false);
  };
  
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user?.uid) return;

    setAvatarUploading(true);
    setAvatarUploadProgress(0);
    try {
      const url = await uploadAvatar(user.uid, file, (progress) => {
        setAvatarUploadProgress(progress);
      });

      if (auth.currentUser) {
        await updateAuthProfile(auth.currentUser, { photoURL: url });
      }
      
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        photoURL: url,
        updatedAt: serverTimestamp()
      };
      await updateDoc(userDocRef, updateData, { merge: true });

      const updatedUserForContext = { 
          ...user, 
          photoURL: url 
      };
      setUser(updatedUserForContext);
      appDispatch({ type: 'SET_USER', payload: { user: updatedUserForContext, token: appState.auth.token } });
      setProfileData(prev => ({...prev, photoURL: url }));

      toast(t('profilePage.success.avatarUpdated', 'Avatar başarıyla güncellendi'), 'success');
    } catch (error) {
      console.error("Avatar yüklenirken hata:", error);
      toast(t('profilePage.errors.avatarUploadError', 'Avatar yüklenirken bir hata oluştu.'), 'error');
    } finally {
      setAvatarUploading(false);
      setAvatarUploadProgress(0);
      if (event.target) {
        event.target.value = null;
      }
    }
  };

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
    toast(t('settingsPage.languageChanged', 'Dil değiştirildi'), 'success');
  };

  const handlePasswordChangeSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError(t('profilePage.settings.passwordsMismatch', 'Yeni şifreler eşleşmiyor.'));
      return;
    }
    if (!currentPassword || !newPassword) {
      setPasswordChangeError(t('profilePage.settings.passwordFieldsRequired', 'Tüm şifre alanları doldurulmalıdır.'));
      return;
    }
    setPasswordChangeLoading(true);
    setPasswordChangeError('');
    try {
      await changePasswordService(currentPassword, newPassword);
      toast(t('profilePage.settings.passwordChangedSuccess', 'Şifre başarıyla değiştirildi.'), 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error("Şifre değiştirme hatası:", error);
      const apiErrorMessage = error.response?.data?.message || error.message;
      setPasswordChangeError(apiErrorMessage || t('profilePage.settings.passwordChangeFailed', 'Şifre değiştirme başarısız oldu. Mevcut şifrenizi kontrol edin.'));
      toast(apiErrorMessage || t('profilePage.settings.passwordChangeFailed', 'Şifre değiştirme başarısız oldu.'), 'error');
    }
    setPasswordChangeLoading(false);
  };

  const handleProfileVisibilityChange = async (event) => {
    const newVisibility = event.target.value;
    setProfileVisibility(newVisibility);
    if (user?.uid) {
      setPrivacySettingsLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { 
          profileVisibility: newVisibility,
          updatedAt: serverTimestamp()
        });
        setProfileData(prev => ({...prev, profileVisibility: newVisibility}));
        toast(t('profilePage.settings.privacy.visibilityChanged', 'Profil görünürlüğü güncellendi.'), 'success');
      } catch (error) {
        console.error("Profil görünürlüğü güncellenirken hata:", error);
        toast(t('profilePage.settings.privacy.updateFailed', 'Ayar güncellenirken bir hata oluştu.'), 'error');
        // Eski değere geri döndür (opsiyonel, UI tutarlılığı için)
        setProfileVisibility(profileData?.profileVisibility || 'public'); 
      }
      setPrivacySettingsLoading(false);
    }
  };

  const handleShareGameActivityChange = async (event) => {
    const newSetting = event.target.checked;
    setShareGameActivity(newSetting);
    if (user?.uid) {
      setPrivacySettingsLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { 
          shareGameActivity: newSetting,
          updatedAt: serverTimestamp()
        });
        setProfileData(prev => ({...prev, shareGameActivity: newSetting}));
        toast(t('profilePage.settings.privacy.gameActivityChanged', 'Oyun aktivitesi paylaşım ayarı güncellendi.'), 'success');
      } catch (error) {
        console.error("Oyun aktivitesi paylaşım ayarı güncellenirken hata:", error);
        toast(t('profilePage.settings.privacy.updateFailed', 'Ayar güncellenirken bir hata oluştu.'), 'error');
        // Eski değere geri döndür
        setShareGameActivity(typeof profileData?.shareGameActivity === 'boolean' ? profileData.shareGameActivity : true);
      }
      setPrivacySettingsLoading(false);
    }
  };

  const handleEmailChangeSubmit = async (event) => {
    event.preventDefault();
    if (newEmail !== confirmNewEmail) {
      setEmailChangeError(t('profilePage.settings.emailChangeEmailMismatch', 'E-postalar eşleşmiyor.'));
      return;
    }
    setEmailChangeLoading(true);
    setEmailChangeError('');
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPasswordForEmail);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, newEmail);
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { email: newEmail, updatedAt: serverTimestamp() });
      await updateProfileApi(profileData.displayName, newEmail);
      setProfileData(prev => ({ ...prev, email: newEmail }));
      const updatedUser = { ...user, email: newEmail };
      setUser(updatedUser);
      appDispatch({ type: 'SET_USER', payload: { user: updatedUser, token: appState.auth.token } });
      toast(t('profilePage.settings.emailChangeSuccess', 'E-posta başarıyla güncellendi.'), 'success');
      setCurrentPasswordForEmail('');
      setNewEmail('');
      setConfirmNewEmail('');
    } catch (error) {
      console.error('E-posta değiştirme hatası:', error);
      const msg = error.response?.data?.message || error.message;
      setEmailChangeError(msg || t('profilePage.settings.emailChangeFailed', 'E-posta değiştirme başarısız oldu. Lütfen tekrar deneyin.'));
      toast(msg || t('profilePage.settings.emailChangeFailed', 'E-posta değiştirme başarısız oldu.'));
    }
    setEmailChangeLoading(false);
  };

  const handleDeleteAccountConfirm = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteAccountService();
      await deleteUser(auth.currentUser);
      toast(t('profilePage.settings.accountDeleteSuccess', 'Hesap başarıyla silindi.'), 'success');
      navigate('/');
    } catch (error) {
      console.error('Hesap silme hatası:', error);
      const msg = error.response?.data?.message || error.message;
      setDeleteError(msg || t('profilePage.settings.accountDeleteFailed', 'Hesap silme başarısız oldu. Lütfen tekrar deneyin.'));
      toast(msg || t('profilePage.settings.accountDeleteFailed', 'Hesap silme başarısız oldu.'));
    }
    setDeleteLoading(false);
  };

  if (loadingProfile) {
    return (
      <Container sx={{ py: 4 }} maxWidth="md">
        <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

  if (!user || !profileData) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6">{t('profileNotLoggedIn', 'Profili görüntülemek için lütfen giriş yapın veya veriler yüklenemedi.')}</Typography>
      </Container>
    );
  }

  const registrationDate = profileData.createdAt || user.metadata?.creationTime;
  const formattedRegistrationDate = registrationDate 
    ? new Date(registrationDate).toLocaleDateString(t('localeCode', 'tr-TR'), { year: 'numeric', month: 'long', day: 'numeric' })
    : t('profilePage.unknown', 'Bilinmiyor');

  return (
    <Container sx={{ py: { xs: 2, md: 4 } }} maxWidth="lg">
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={3} alignItems="center" sx={{mb: 3}}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{position: 'relative', mb: 1}}>
              <Avatar 
                src={profileData.photoURL || user.photoURL || undefined} 
                alt={profileData.displayName || user.displayName || 'U'} 
                sx={{ width: 120, height: 120, fontSize: '3rem', bgcolor: 'primary.main' }}
              >
                {!(profileData.photoURL || user.photoURL) && (profileData.displayName || user.displayName || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <input 
                accept="image/*" 
                style={{ display: 'none' }} 
                id="icon-button-file"
                type="file" 
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
              />
              <label htmlFor="icon-button-file">
                <IconButton 
                  color="primary" 
                  aria-label="upload picture"
                  component="span"
                  size="small"
                  sx={{position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.8)', '&:hover': {backgroundColor: 'white'} }}
                  disabled={avatarUploading}
                >
                  {avatarUploading ? <CircularProgress size={20} sx={{color: 'primary.main'}} /> : <PhotoCamera sx={{fontSize: '1.2rem'}}/>}
                </IconButton>
              </label>
            </Box>
            {avatarUploading && (
              <Box sx={{ width: '80%', mt: 0.5 }}>
                <LinearProgress variant="determinate" value={avatarUploadProgress} />
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={9}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: {xs: 'center', md: 'space-between'}, flexWrap: 'wrap'}}>
                <Typography variant="h4" component="h1" sx={{ textAlign: { xs: 'center', md: 'left' }, width: {xs: '100%', md: 'auto'} }}>
                    {profileData.displayName || user.displayName || t('anonymousUser', 'Anonim Kullanıcı')}
                </Typography>
                <Button variant="outlined" startIcon={<EditIcon />} onClick={handleOpenEditModal} sx={{mt: {xs: 1, md: 0}}}>
                    {t('profilePage.editProfileButton', 'Profili Düzenle')}
                </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: { xs: 'center', md: 'left' } }}>
              {t('profilePage.memberSince', 'Üyelik Tarihi:')} {formattedRegistrationDate}
            </Typography>
            <Box sx={{mt: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>{t('profilePage.bio', 'Hakkımda')}</Typography>
              {profileData.bio ? (
                <Typography variant="body2" color="text.secondary" sx={{fontStyle: 'italic', whiteSpace: 'pre-wrap'}}>
                  {profileData.bio}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{fontStyle: 'italic'}}>
                  {t('profilePage.noBio', 'Henüz bir biyografi eklenmemiş.')}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Dialog open={openEditModal} onClose={handleCloseEditModal} fullWidth maxWidth="sm">
          <DialogTitle>{t('profilePage.editProfileModalTitle', 'Profil Bilgilerini Düzenle')}</DialogTitle>
          <DialogContent dividers>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label={t('profilePage.nameLabel', 'Ad / Rumuz')}
              type="text"
              fullWidth
              variant="outlined"
              value={nameEdit}
              onChange={(e) => setNameEdit(e.target.value)}
              sx={{mb: 2}}
            />
            <TextField
              margin="dense"
              id="bio"
              label={`${t('profilePage.bioLabel', 'Biyografi')} (${bioEdit.length}/${MAX_BIO_LENGTH})`}
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={bioEdit}
              onChange={(e) => setBioEdit(e.target.value.slice(0, MAX_BIO_LENGTH))}
              inputProps={{ maxLength: MAX_BIO_LENGTH }}
              helperText={t('profilePage.bioHelper', 'Kendinizi kısaca tanıtın.')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal}>{t('cancel', 'İptal')}</Button>
            <Button onClick={handleEditSubmit} disabled={loadingEdit || !nameEdit.trim()} variant="contained">
              {loadingEdit ? <CircularProgress size={24} /> : t('save', 'Kaydet')}
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="Profil sekmeleri" variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            <Tab label={t('profilePage.tabs.overview', 'Genel Bakış')} {...a11yProps(0)} />
            <Tab label={t('profilePage.tabs.gameHistory', 'Oyun Geçmişi')} {...a11yProps(1)} />
            <Tab label={t('profilePage.tabs.settings', 'Ayarlar')} {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={currentTab} index={0}>
          <Typography variant="h6">{t('profilePage.tabs.overview', 'Genel Bakış')}</Typography>
          {loadingProfile ? (
            <CircularProgress sx={{ mt: 2 }} />
          ) : (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar src={profileData.photoURL || user.photoURL} sx={{ width: 80, height: 80, mr: 2 }} />
                <Box>
                  <Typography variant="h5">{profileData.displayName || user.displayName}</Typography>
                  <Typography>{profileData.bio}</Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography>Email: {profileData.email || user.email}</Typography>
                <Typography>Katıldı: {profileData.createdAt ? format(profileData.createdAt.toDate(), 'dd.MM.yyyy') : '-'}</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">{gameHistory.length}</Typography>
                    <Typography>{t('profilePage.overview.totalGames', 'Toplam Oyun')}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">{gameHistory.filter(h => h.game === 'Tombala').length}</Typography>
                    <Typography>{t('profilePage.overview.tombalaGames', 'Tombala Oyunları')}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">{gameHistory.filter(h => h.game === '2048').length}</Typography>
                    <Typography>{t('profilePage.overview.2048Games', '2048 Oyunları')}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">{Math.max(...gameHistory.map(h => h.score), 0)}</Typography>
                    <Typography>{t('profilePage.overview.bestScore', 'En Yüksek Skor')}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6">{t('profilePage.tabs.gameHistory', 'Oyun Geçmişi')}</Typography>
          {loadingHistory ? (
            <CircularProgress sx={{ mt: 2 }} />
          ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('profilePage.gameHistory.date', 'Tarih')}</TableCell>
                  <TableCell>{t('profilePage.gameHistory.game', 'Oyun')}</TableCell>
                  <TableCell>{t('profilePage.gameHistory.score', 'Skor')}</TableCell>
                  <TableCell>{t('profilePage.gameHistory.result', 'Sonuç')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gameHistory.map(h => (
                  <TableRow key={h.id}>
                    <TableCell>{format(h.date, 'dd.MM.yyyy HH:mm')}</TableCell>
                    <TableCell>{h.game}</TableCell>
                    <TableCell>{h.score}</TableCell>
                    <TableCell>{h.result}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <Typography variant="h5" component="h2" gutterBottom sx={{mb: 2}}>
            {t('profilePage.tabs.settings', 'Ayarlar')}
          </Typography>
          
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="appearance-settings-content" id="appearance-settings-header">
              <PaletteIcon sx={{mr: 1, color: 'text.secondary'}} />
              <Typography variant="h6">{t('settingsPage.appearanceTitle', 'Görünüm')}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={currentTheme === 'dark'} onChange={toggleTheme} />}
                  label={currentTheme === 'dark'
                    ? t('settingsPage.themeLabel.dark', 'Koyu Tema (Karanlık)')
                    : t('settingsPage.themeLabel.light', 'Açık Tema (Aydınlık)')}
                />
              </FormGroup>
              <MUIFormControl fullWidth variant="outlined">
                <InputLabel id="language-select-label">{t('settingsPage.languageLabel', 'Dil')}</InputLabel>
                <Select
                  labelId="language-select-label"
                  value={i18n.language}
                  label={t('settingsPage.languageLabel', 'Dil')}
                  onChange={handleLanguageChange}
                  size="small"
                >
                  <MenuItem value="tr">Türkçe</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </MUIFormControl>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="account-settings-content" id="account-settings-header">
              <AccountCircleIcon sx={{mr: 1, color: 'text.secondary'}} />
              <Typography variant="h6">{t('settingsPage.accountTitle', 'Hesap')}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
              <Typography variant="subtitle1" gutterBottom>
                {t('profilePage.settings.changePasswordTitle', 'Şifreyi Değiştir')}
              </Typography>
              {passwordChangeError && (
                <Alert severity="error" sx={{ mb: 2 }}>{passwordChangeError}</Alert>
              )}
              <Box component="form" onSubmit={handlePasswordChangeSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  name="currentPassword"
                  label={t('profilePage.settings.currentPasswordLabel', 'Mevcut Şifre')}
                  type="password"
                  id="currentPassword"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={passwordChangeLoading}
                  size="small"
                />
                <TextField
                  required
                  fullWidth
                  name="newPassword"
                  label={t('profilePage.settings.newPasswordLabel', 'Yeni Şifre')}
                  type="password"
                  id="newPassword"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordChangeLoading}
                  size="small"
                />
                <TextField
                  required
                  fullWidth
                  name="confirmNewPassword"
                  label={t('profilePage.settings.confirmNewPasswordLabel', 'Yeni Şifreyi Onayla')}
                  type="password"
                  id="confirmNewPassword"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={passwordChangeLoading}
                  size="small"
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={passwordChangeLoading || !currentPassword || !newPassword || !confirmNewPassword}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {passwordChangeLoading ? <CircularProgress size={24} /> : t('profilePage.settings.updatePasswordButton', 'Şifreyi Güncelle')}
                </Button>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                {t('profilePage.settings.emailChangeTitle', 'E-posta Değiştir')}
              </Typography>
              {emailChangeError && (
                <Alert severity="error" sx={{ mb: 2 }}>{emailChangeError}</Alert>
              )}
              <Box component="form" onSubmit={handleEmailChangeSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  name="currentPasswordForEmail"
                  label={t('profilePage.settings.currentPasswordForEmailLabel', 'Mevcut Şifre')}
                  type="password"
                  value={currentPasswordForEmail}
                  onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                  disabled={emailChangeLoading}
                  size="small"
                />
                <TextField
                  required
                  fullWidth
                  name="newEmail"
                  label={t('profilePage.settings.newEmailLabel', 'Yeni E-posta')}
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={emailChangeLoading}
                  size="small"
                />
                <TextField
                  required
                  fullWidth
                  name="confirmNewEmail"
                  label={t('profilePage.settings.confirmNewEmailLabel', 'E-posta Onayı')}
                  type="email"
                  value={confirmNewEmail}
                  onChange={(e) => setConfirmNewEmail(e.target.value)}
                  disabled={emailChangeLoading}
                  size="small"
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={emailChangeLoading || !currentPasswordForEmail || !newEmail || newEmail !== confirmNewEmail}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {emailChangeLoading ? <CircularProgress size={24} /> : t('profilePage.settings.emailChangeButton', 'E-posta Güncelle')}
                </Button>
              </Box>

              <Typography variant="subtitle1" sx={{ mt: 3 }}>
                {t('profilePage.settings.accountDeleteTitle', 'Hesabı Sil')}
              </Typography>
              <Button
                color="error"
                variant="outlined"
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ mt: 1 }}
              >
                {t('profilePage.settings.deleteAccountButton', 'Hesabı Sil')}
              </Button>

              <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>{t('profilePage.settings.accountDeleteTitle', 'Hesabı Sil')}</DialogTitle>
                <DialogContent>
                  <Typography>{t('profilePage.settings.accountDeleteConfirmation', 'Bu işlemi onaylıyor musunuz? Bu işlem geri alınamaz.')}</Typography>
                  {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
                    {t('profilePage.settings.cancelButton', 'İptal')}
                  </Button>
                  <Button
                    color="error"
                    onClick={handleDeleteAccountConfirm}
                    disabled={deleteLoading}
                    variant="contained"
                  >
                    {deleteLoading ? <CircularProgress size={24} /> : t('profilePage.settings.deleteAccountButton', 'Hesabı Sil')}
                  </Button>
                </DialogActions>
              </Dialog>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="notification-settings-content" id="notification-settings-header">
              <NotificationsIcon sx={{mr: 1, color: 'text.secondary'}} />
              <Typography variant="h6">{t('settingsPage.notificationsTitle', 'Bildirimler')}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={settings.notificationsEnabled || false} onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)} />}
                  label={t('profilePage.settings.notifications.general', 'Genel Bildirimler')}
                />
                <FormControlLabel
                  control={<Switch checked={settings.gameInviteNotificationsEnabled || false} onChange={(e) => updateSetting('gameInviteNotificationsEnabled', e.target.checked)} />}
                  label={t('profilePage.settings.notifications.gameInvites', 'Oyun Davetleri')}
                />
                <FormControlLabel
                  control={<Switch checked={settings.lobbyActivityNotificationsEnabled || false} onChange={(e) => updateSetting('lobbyActivityNotificationsEnabled', e.target.checked)} />}
                  label={t('profilePage.settings.notifications.lobbyActivity', 'Lobi Etkinlikleri (oluşturma, başlama vb.)')}
                />
                <FormControlLabel
                  control={<Switch checked={settings.friendRequestNotificationsEnabled || false} onChange={(e) => updateSetting('friendRequestNotificationsEnabled', e.target.checked)} />}
                  label={t('profilePage.settings.notifications.friendRequests', 'Arkadaşlık İstekleri')}
                />
                <FormControlLabel
                  control={<Switch checked={settings.generalAnnouncementNotificationsEnabled || false} onChange={(e) => updateSetting('generalAnnouncementNotificationsEnabled', e.target.checked)} />}
                  label={t('profilePage.settings.notifications.generalAnnouncements', 'Genel Duyurular ve Güncellemeler')}
                />
                <FormControlLabel
                  control={<Switch checked={settings.chatNotificationsEnabled || false} onChange={(e) => updateSetting('chatNotificationsEnabled', e.target.checked)} />}
                  label={t('profilePage.settings.notifications.chatMessages', 'Sohbet Mesajları (DM ve Genel)')}
                />
                <FormControlLabel
                  control={<Switch checked={settings.achievementNotificationsEnabled || false} onChange={(e) => updateSetting('achievementNotificationsEnabled', e.target.checked)} />}
                  label={t('profilePage.settings.notifications.achievements', 'Başarım Bildirimleri')}
                />
                <FormControlLabel
                  control={<Switch checked={settings.soundEnabled || false} onChange={(e) => updateSetting('soundEnabled', e.target.checked)} />}
                  label={t('profilePage.settings.notifications.soundEffects', 'Ses Efektleri')}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="privacy-settings-content" id="privacy-settings-header">
              <PrivacyTipIcon sx={{mr: 1, color: 'text.secondary'}} />
              <Typography variant="h6">{t('settingsPage.privacyTitle', 'Gizlilik')}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
              <MUIFormControl component="fieldset" disabled={privacySettingsLoading}>
                <FormLabel component="legend">{t('profilePage.settings.privacy.profileVisibilityLabel', 'Profil Görünürlüğü')}</FormLabel>
                <RadioGroup
                  row
                  aria-label="profile-visibility"
                  name="profile-visibility-radio-buttons-group"
                  value={profileVisibility}
                  onChange={handleProfileVisibilityChange}
                >
                  <FormControlLabel value="public" control={<Radio size="small" />} label={t('profilePage.settings.privacy.visibility.public', 'Herkes')} />
                  <FormControlLabel value="friends_only" control={<Radio size="small" />} label={t('profilePage.settings.privacy.visibility.friendsOnly', 'Sadece Arkadaşlarım')} />
                  <FormControlLabel value="private" control={<Radio size="small" />} label={t('profilePage.settings.privacy.visibility.private', 'Sadece Ben')} />
                </RadioGroup>
              </MUIFormControl>

              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={shareGameActivity} onChange={handleShareGameActivityChange} disabled={privacySettingsLoading} />}
                  label={t('profilePage.settings.privacy.shareGameActivityLabel', 'Oyun Aktivitelerimi Paylaş')}
                />
              </FormGroup>
              {privacySettingsLoading && <CircularProgress size={24} sx={{alignSelf: 'center'}}/>}
            </AccordionDetails>
          </Accordion>

        </TabPanel>
      </Paper>
    </Container>
  );
}

export default ProfilePage;