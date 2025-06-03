import React, { useContext } from 'react';
import { MenuItem, ListItemIcon, ListItemText, Typography, Button, Box, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext'; // Dispatch için
import { useTranslation } from 'react-i18next';

// İkonlar (Örnekler - bildirim tipine göre çeşitlendirilebilir)
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'; // Oyun daveti için
import CelebrationIcon from '@mui/icons-material/Celebration'; // Başarım, etkinlik
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'; // Okunmadı ikonu

// Zaman formatlama fonksiyonu (utils'e taşınabilir)
const formatTimeAgo = (timestamp, t) => {
  if (!timestamp) return '';
  const now = new Date();
  const seconds = Math.round((now - new Date(timestamp)) / 1000);

  if (seconds < 60) return t('azOnce', 'az önce');
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return t('dakikaOnce', '{{count}} dakika önce', { count: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 24) return t('saatOnce', '{{count}} saat önce', { count: hours });
  const days = Math.round(hours / 24);
  return t('gunOnce', '{{count}} gün önce', { count: days });
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'gameInvite':
      return <SportsEsportsIcon fontSize="small" color="secondary" />;
    case 'achievement':
      return <CelebrationIcon fontSize="small" color="warning" />;
    case 'warning':
      return <WarningIcon fontSize="small" color="error" />;
    case 'info':
    default:
      return <InfoIcon fontSize="small" color="info" />;
  }
};

function NotificationItem({ notification, onCloseMenu }) {
  const { dispatch } = useContext(AppContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNotificationClick = () => {
    if (!notification.read) {
      dispatch({ type: 'MARK_NOTIFICATION_AS_READ', payload: notification.id });
    }
    if (notification.link) {
      navigate(notification.link);
    }
    onCloseMenu(); // Menüyü kapat
  };

  return (
    <MenuItem 
      onClick={handleNotificationClick} 
      sx={{
        backgroundColor: !notification.read ? 'action.hover' : 'transparent',
        alignItems: 'flex-start',
        py: 1.5, // Biraz daha fazla padding
        borderBottom: theme => `1px solid ${theme.palette.divider}`,
        '&:last-child': {
            borderBottom: 'none',
        }
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, mt: '4px' }}>
        {getNotificationIcon(notification.type)}
      </ListItemIcon>
      <ListItemText
        primary=
          <Typography variant="body2" sx={{ fontWeight: !notification.read ? 600 : 400, whiteSpace: 'normal'}}>
            {notification.message}
          </Typography>
        secondary=
          <Typography variant="caption" color="text.secondary">
            {formatTimeAgo(notification.timestamp, t)}
          </Typography>
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml:1 }}>
        {!notification.read && (
          <Tooltip title={t('okunmadi', 'Okunmadı')} placement="top">
              <FiberManualRecordIcon sx={{ fontSize: 10, color: 'secondary.main', mb: 0.5 }} />
          </Tooltip>
        )}
        {notification.actionText && notification.actionLink && (
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // MenuItem'ın ana onClick olayını tetiklemeyi engelle
              if (!notification.read) {
                dispatch({ type: 'MARK_NOTIFICATION_AS_READ', payload: notification.id });
              }
              navigate(notification.actionLink);
              onCloseMenu(); // Menüyü kapat
            }}
            sx={{ mt: 0.5, textTransform: 'none', py: 0.2, px: 0.8, fontSize: '0.75rem' }}
          >
            {notification.actionText}
          </Button>
        )}
      </Box>
      {/* TODO: actionDispatch için de destek eklenebilir */}
    </MenuItem>
  );
}

export default NotificationItem; 