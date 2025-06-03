import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Switch, FormControlLabel, FormControl, FormGroup, InputLabel, Select, MenuItem, Button, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails, Alert } from '@mui/material';
import Paper from '@mui/material/Paper';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
// import { AppContext } from '../contexts/AppContext'; // themeMode artık kullanılmıyor
import { UserContext } from '../contexts/UserContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import useToast from '../hooks/useToast';
import auth from '../firebase';
import { updateEmail, updateProfile as updateAuthProfile } from 'firebase/auth';
import { changePassword, updateProfile, deleteAccount } from '../services/authService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AvatarUpload from '../components/atoms/AvatarUpload';
import { uploadAvatar } from '../services/storageService';

function SettingsPage() {
  const { t, i18n } = useTranslation();
  // const { state, dispatch } = useContext(AppContext);
  const { user, setUser } = useContext(UserContext);
  const { settings, updateSetting } = useContext(SettingsContext);
  const { currentTheme, toggleTheme } = useCustomTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || user.photoURL || '');

  const handleLanguage = (event) => {
    // dispatch({ type: 'SET_LOCALE', payload: event.target.value });
    i18n.changeLanguage(event.target.value);
    toast(t('settingsPage.languageChanged', 'Dil değiştirildi'), 'success');
  };
  const handleSound = (e) => { updateSetting('soundEnabled', e.target.checked); toast(t('settingsSaved'), 'success'); };
  const handleNotifications = (e) => { updateSetting('notificationsEnabled', e.target.checked); toast(t('settingsSaved'), 'success'); };
  const handleChatNotifications = (e) => { updateSetting('chatNotificationsEnabled', e.target.checked); toast(t('settingsSaved'), 'success'); };
  const handleAchievementNotifications = (e) => { updateSetting('achievementNotificationsEnabled', e.target.checked); toast(t('settingsSaved'), 'success'); };

  const handleAvatarUpload = async (file, onProgress) => {
    try {
      const url = await uploadAvatar(user.id, file, onProgress);
      await updateAuthProfile(auth.currentUser, { photoURL: url });
      await updateDoc(doc(db, 'users', user.id), { avatarUrl: url });
      // dispatch({ type: 'SET_USER', payload: { user: { ...user, avatarUrl: url, photoURL: url }, token: state.auth.token } });
      setUser({ ...user, avatarUrl: url, photoURL: url });
      setAvatarUrl(url);
      toast(t('profileUpdated'), 'success');
    } catch (err) {
      console.error(err);
      toast(t('avatarUploadFailed') || 'Avatar yüklenirken hata oluştu', 'error');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('ayarlarSayfasiBaslik', 'Ayarlar')}
      </Typography>
      
      <Paper elevation={3} sx={{p:3, mb:3}}>
        <Typography variant="h6" gutterBottom>{t('gorunumAyarlariBaslik', 'Görünüm Ayarları')}</Typography>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={currentTheme === 'dark'} onChange={toggleTheme} />}
            label={currentTheme === 'dark' ? t('oyunTemasiAktif', 'Oyun Teması (Koyu)') : t('merkezTemasiAktif', 'Oyun Merkezi Teması (Açık)')}
          />
        </FormGroup>
        <FormControl fullWidth margin="normal">
          <InputLabel id="language-select-label">{t('dilSecimiLabel', 'Dil')}</InputLabel>
          <Select
            labelId="language-select-label"
            value={i18n.language}
            label={t('dilSecimiLabel', 'Dil')}
            onChange={handleLanguage}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="tr">Türkçe</MenuItem>
            {/* Diğer diller eklenebilir */}
          </Select>
        </FormControl>
      </Paper>

      <Paper elevation={3} sx={{p:3, mb:3}}>
        <Typography variant="h6" gutterBottom>{t('bildirimAyarlariBaslik', 'Bildirim Ayarları')}</Typography>
        <FormGroup>
          <FormControlLabel control={<Switch defaultChecked />} label={t('oyunDavetleriBildirimLabel', 'Oyun Davetleri')} />
          <FormControlLabel control={<Switch />} label={t('lobiEtkinlikleriBildirimLabel', 'Lobi Etkinlikleri')} />
          <FormControlLabel control={<Switch defaultChecked />} label={t('arkadaslikIstekleriBildirimLabel', 'Arkadaşlık İstekleri')} />
        </FormGroup>
         <Button variant="outlined" sx={{mt:2}}>{t('detayliBildirimAyarlari', 'Detaylı Bildirim Ayarları')}</Button>
      </Paper>

      {/* Diğer ayar grupları eklenebilir (örn: Hesap, Gizlilik vb.) */}
    </Box>
  );
}

export default SettingsPage;
