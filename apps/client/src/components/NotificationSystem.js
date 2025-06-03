import React, { useState, useContext, createContext } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  SportsEsports as GameIcon,
  Group as LobbyIcon,
  EmojiEvents as TrophyIcon,
  Event as EventIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Bildirim Bağlamı
export const NotificationContext = createContext();

// Bildirim türleri ve ikonları
const NOTIFICATION_TYPES = {
  GAME: { icon: GameIcon, color: 'primary' },
  LOBBY: { icon: LobbyIcon, color: 'info' },
  ACHIEVEMENT: { icon: TrophyIcon, color: 'success' },
  EVENT: { icon: EventIcon, color: 'warning' }
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Snackbar göster
    setSnackbar({
      open: true,
      message: notification.message,
      severity: NOTIFICATION_TYPES[notification.type]?.color || 'info'
    });
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    clearNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function NotificationBell() {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, markAsRead, clearNotification, clearAllNotifications } = useContext(NotificationContext);

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasNotifications = notifications.length > 0;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.onClick) {
      notification.onClick();
    }
    handleClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        size="large"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 360,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {t('notifications', 'Bildirimler')}
          </Typography>
          {hasNotifications && (
            <IconButton size="small" onClick={clearAllNotifications}>
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {!hasNotifications ? (
          <MenuItem disabled>
            <ListItemText>
              {t('noNotifications', 'Bildirim bulunmuyor')}
            </ListItemText>
          </MenuItem>
        ) : (
          notifications.map((notification) => {
            const NotificationIcon = NOTIFICATION_TYPES[notification.type]?.icon || NotificationsIcon;
            const color = NOTIFICATION_TYPES[notification.type]?.color || 'default';

            return (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  position: 'relative',
                }}
              >
                <ListItemIcon>
                  <NotificationIcon color={color} />
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.timestamp).toLocaleString()}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: notification.read ? 'normal' : 'bold',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(notification.id);
                  }}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    visibility: 'hidden',
                    '.MuiMenuItem-root:hover &': {
                      visibility: 'visible',
                    },
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </MenuItem>
            );
          })
        )}
      </Menu>
    </>
  );
}

// Kullanım örneği:
// const { addNotification } = useContext(NotificationContext);
// addNotification({
//   type: 'GAME',
//   message: 'Yeni bir oyun daveti aldınız!',
//   onClick: () => navigate('/games/123')
// }); 