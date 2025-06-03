// src/components/Navbar.js

/**
 * src/components/Navbar.js: Uygulama üst navigasyon çubuğu bileşeni.
 * Kullanıcının giriş durumuna göre oturum yönetimi, dil seçimi ve sayfalar arası geçiş sağlar.
 * Context ve router hookları kullanır.
 *
 * @returns {JSX.Element} Navbar bileşeni.
 */
import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Box,
  useMediaQuery,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import GroupsIcon from '@mui/icons-material/Groups';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

function Navbar() {
  const { t } = useTranslation();
  const { toggleTheme, currentTheme } = useCustomTheme();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const hideFriendButton = location.pathname === '/' || location.pathname === '/home';
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {isMobile && (
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          Oyun Merkezi
        </Typography>
        {/* Masaüstü Navigasyon Linkleri */}
        {!isMobile && user && (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              color="inherit" 
              component={NavLink} 
              to="/"
              style={({ isActive }) => isActive ? { fontWeight: 'bold', borderBottom: '2px solid white' } : {}}
            >
              {t('homePage')}
            </Button>
            <Button 
              color="inherit" 
              component={NavLink} 
              to="/games"
              style={({ isActive }) => isActive ? { fontWeight: 'bold', borderBottom: '2px solid white' } : {}}
            >
              {t('games')}
            </Button>
            <Button 
              color="inherit" 
              component={NavLink} 
              to="/stats"
              style={({ isActive }) => isActive ? { fontWeight: 'bold', borderBottom: '2px solid white' } : {}}
            >
              {t('statisticsPage', 'İstatistikler')}
            </Button>
            <Button 
              color="inherit" 
              component={NavLink} 
              to="/chat"
              style={({ isActive }) => isActive ? { fontWeight: 'bold', borderBottom: '2px solid white' } : {}}
            >
              {t('generalChat', 'Genel Sohbet')}
            </Button>
          </Box>
        )}
        {/* Tema Değiştirme Butonu */}
        <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
          {currentTheme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        {user ? (
          <Box>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleMenu}
            >
              {user.photoURL ? (
                <Avatar src={user.photoURL} alt={user.displayName || 'User'} sx={{ width: 32, height: 32 }} />
              ) : (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : <AccountCircle />}
                </Avatar>
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate('/home#chat-section');
                }}
              >
                {t('chat')}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate('/profile');
                }}
              >
                {t('profile')}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate('/settings');
                }}
              >
                {t('settings')}
              </MenuItem>
              <MenuItem onClick={handleLogout}>{t('logout')}</MenuItem>
            </Menu>
          </Box>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              {t('login')}
            </Button>
            <Button color="inherit" component={Link} to="/register" sx={{ ml: 1 }}>
              {t('register')}
            </Button>
          </>
        )}
      </Toolbar>
      {isMobile && (
        <SwipeableDrawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onOpen={() => setDrawerOpen(true)}
        >
          <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)} onKeyDown={() => setDrawerOpen(false)}>
            <List>
              <ListItem button component={Link} to="/home">
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary={t('homePage')} />
              </ListItem>
              {!user && (
                <>
                  <ListItem button component={Link} to="/login">
                    <ListItemIcon><AccountCircle /></ListItemIcon>
                    <ListItemText primary={t('login')} />
                  </ListItem>
                  <ListItem button component={Link} to="/register">
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText primary={t('register')} />
                  </ListItem>
                </>
              )}
              {/* Mobil Navigasyon Linkleri - user varsa göster */} 
              {user && (
                <>
                  <ListItem button component={Link} to="/games">
                    <ListItemIcon><SportsEsportsIcon /></ListItemIcon>
                    <ListItemText primary={t('games')} />
                  </ListItem>
                  <ListItem button component={Link} to="/stats">
                    <ListItemIcon><LeaderboardIcon /></ListItemIcon>
                    <ListItemText primary={t('statisticsPage', 'İstatistikler')} />
                  </ListItem>
                </>
              )}
              <ListItem button component={Link} to="/chat">
                <ListItemIcon><ChatIcon /></ListItemIcon>
                <ListItemText primary={t('generalChat', 'Genel Sohbet')} />
              </ListItem>
              <ListItem button component={Link} to="/profile">
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary={t('profile')} />
              </ListItem>
              <ListItem button component={Link} to="/settings">
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary={t('settings')} />
              </ListItem>
            </List>
          </Box>
        </SwipeableDrawer>
      )}
    </AppBar>
  );
}

export default Navbar;