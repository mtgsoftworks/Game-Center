import React, { useState, useContext } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Avatar, Button, Container, Paper, Tabs, Tab, Badge } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Mobil için gerekebilir
import AdbIcon from '@mui/icons-material/Adb'; // Örnek logo ikonu
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Koyu tema ikonu
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Açık tema ikonu
import NotificationsIcon from '@mui/icons-material/Notifications'; // Bildirim ikonu eklendi
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext'; // UserContext'i import ediyoruz
import { AppContext } from '../../contexts/AppContext'; // AppContext logout ve tema için
import { logout as logoutService } from '../../services/authService'; // logout servisi
import NotificationItem from './NotificationItem'; // NotificationItem import edildi

// Navigasyon linkleri
const navLinks = [
  { label: 'Ana Sayfa', path: '/home' },
  { label: 'Oyunlar', path: '/games' },
  { label: 'İstatistikler', path: '/stats' },
  { label: 'Genel Sohbet', path: '/chat' },
];

function NavBar() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext); // UserContext'ten kullanıcı bilgilerini ve setUser'ı alıyoruz
  const { state, dispatch } = useContext(AppContext); // AppContext'ten state ve dispatch alıyoruz

  const unreadNotificationsCount = state.notifications?.filter(n => !n.read).length || 0;

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Oyuncu';
  const userAvatar = user?.photoURL;

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null); // Bildirim menüsü için

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
    // İsteğe bağlı: Menü açıldığında tüm bildirimleri okundu sayabiliriz veya sadece görünenleri
    // dispatch({ type: 'MARK_ALL_NOTIFICATIONS_AS_READ' }); 
  };

  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    try {
      await logoutService(); // Backend'den çıkış yap
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // Global state'i temizle
      dispatch({ type: 'SET_USER', payload: { user: null, token: null } });
      setUser(null); // UserContext'i de temizle
      navigate('/login');
    }
  };

  const handleNavigate = (path) => {
    handleCloseUserMenu();
    navigate(path);
  };
  
  // Aktif sekmeyi belirlemek için
  // React Router v6'da `useMatch` veya `location.pathname` kullanılabilir.
  // Şimdilik basit bir `location.pathname` kontrolü ile yapalım.
  const currentPath = window.location.pathname;


  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'primary.main' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Sol Üst Logo */}
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/home"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            OYUN MERKEZİ
          </Typography>

          {/* Mobil için Logo ve Menü (Gerekirse eklenecek) */}
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
           <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/home"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            MERKEZ
          </Typography>

          {/* Orta Navigasyon Linkleri (Header Altında Değil, Üst Barda) */}
          {/* prompt.md'de "Header'ın altında basit bir navigasyon menüsü" denmiş, bu farklı bir yaklaşım gerektirir.
              Şimdilik bu linkleri AppBar içine alıyorum. Gerekirse ayrı bir Paper component ile altına eklenebilir.
           */}
          {
          /*
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {navLinks.map((link) => (
              <Button
                key={link.label}
                onClick={() => navigate(link.path)}
                sx={{ my: 2, color: 'white', display: 'block', mx:1, '&:hover': {backgroundColor: 'primary.light'} }}
                variant={currentPath.startsWith(link.path) ? "outlined" : "text"}
              >
                {link.label}
              </Button>
            ))}
          </Box>
          */
          }
          {/* Sağ Üst Alan (Tema Butonu ve Kullanıcı Profili) */}
          {/* Navigasyon AppBar dışına alındığı için, bu bölümün flexGrow: 1 ile sola yaslanması gerekebilir veya ortadaki linkler için flexGrow:1 olan Box kalabilir ve bu sağa yaslanır. Şimdilik sağda kalacak şekilde bırakıyorum. */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }} /> {/* Sol taraftaki logo ve başlık ile sağdaki ikonlar arasını doldurur */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Tema Değiştirme Butonu */}
            <IconButton
              sx={{ ml: 1, color: 'white' }}
              onClick={() => dispatch({ type: 'TOGGLE_THEME_MODE' })}
              color="inherit"
              title={state.themeMode === 'gameSpecific' ? "Açık Temaya Geç" : "Koyu Temaya Geç"} // Tooltip eklendi
            >
              {state.themeMode === 'gameSpecific' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* Bildirim Menüsü Butonu */}
            <IconButton
              color="inherit"
              sx={{ ml: 1 }}
              onClick={handleOpenNotificationsMenu}
              title="Bildirimler"
            >
              <Badge badgeContent={unreadNotificationsCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Kullanıcı Profili */}
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
              <Avatar alt={userName} src={userAvatar} >
                {!userAvatar && userName.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => handleNavigate('/profile')}>
                <AccountCircleIcon sx={{ mr: 1 }} />
                <Typography textAlign="center">Profil</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleNavigate('/settings')}>
                <SettingsIcon sx={{ mr: 1 }} />
                <Typography textAlign="center">Ayarlar</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToAppIcon sx={{ mr: 1 }} />
                <Typography textAlign="center">Çıkış Yap</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
      
      {/* Bildirim Merkezi Menüsü (Popover veya Menu kullanılabilir) */}
      <Menu
        id="notifications-menu"
        anchorEl={anchorElNotifications}
        open={Boolean(anchorElNotifications)}
        onClose={handleCloseNotificationsMenu}
        MenuListProps={{
          'aria-labelledby': 'notifications-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '350px',
          },
        }}
      >
        {/* Buraya NotificationItem bileşenleri listelenecek */}
        {state.notifications?.length > 0 ? (
          state.notifications.map(notif => (
            <NotificationItem 
              key={notif.id} 
              notification={notif} 
              onCloseMenu={handleCloseNotificationsMenu} 
            />
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>Yeni bildirim yok.</Typography>
          </MenuItem>
        )}
        {state.notifications?.length > 0 && (
            <MenuItem 
                onClick={() => {
                    // TODO: /notifications sayfasına yönlendir
                    console.log("Tüm bildirimler sayfasına gidilecek.");
                    handleCloseNotificationsMenu();
                }} 
                sx={{justifyContent: 'center', borderTop: theme => `1px solid ${theme.palette.divider}`, backgroundColor: 'action.selected', '&:hover': {backgroundColor: 'action.hover'}}}
            >
                <Button size="small" fullWidth>Tüm Bildirimleri Gör</Button>
            </MenuItem>
        )}
      </Menu>

      {/* Header'ın altında basit bir navigasyon menüsü */}
      <Paper elevation={1} square sx={{ backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Tabs
            value={currentPath} // Aktif sekmeyi belirlemek için
            // onChange={(event, newValue) => navigate(newValue)} // useNavigate ile yönetilecek
            indicatorColor="secondary"
            textColor="primary" // Temadan alacak şekilde ayarlandı
            variant="standard" 
            aria-label="Ana navigasyon"
            sx={{
              "& .MuiTab-root": { 
                minWidth: 'auto', 
                padding: '12px 16px',
                marginRight: theme => theme.spacing(1),
                color: 'text.primary'
              },
              "& .Mui-selected": { 
                color: 'secondary.main', 
                fontWeight: 'bold'
              },
              "& .MuiTabs-indicator": { backgroundColor: 'secondary.main' }
            }}
          >
            {navLinks.map((link) => (
              <Tab 
                key={link.label} 
                label={link.label} 
                value={link.path} 
                component={RouterLink} 
                to={link.path} 
              />
            ))}
          </Tabs>
        </Container>
      </Paper>
    </AppBar>
  );
}

export default NavBar; 