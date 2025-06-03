import React, { useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Box,
} from '@mui/material';
import FriendRequestsMenu from './organisms/FriendRequestsMenu';
import { Link } from 'react-router-dom';
import { Brightness7Icon, Brightness4Icon } from '@mui/icons-material';

const Navbar = () => {
  const user = useContext(UserContext);
  const mode = useContext(ThemeModeContext);
  const toggleColorMode = useContext(ThemeModeContext);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          Oyun Merkezi
        </Typography>
        <IconButton color="inherit" onClick={toggleColorMode} sx={{ mr: 1 }}>
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        {user && <FriendRequestsMenu />}
        {user ? (
          <Box>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleMenu}
            >
              {/* User menu content */}
            </IconButton>
          </Box>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            Giriş
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 