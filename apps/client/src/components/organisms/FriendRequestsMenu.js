import React, { useState } from 'react';
import { IconButton, Badge, Menu, MenuItem, Divider, ListItemAvatar, Avatar, ListItemText, Button, Box, Typography } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useIncomingFriendRequests, useOutgoingFriendRequests, useRespondFriendRequest } from '../../hooks/useFriendRequests';
import useToast from '../../hooks/useToast';

const FriendRequestsMenu = () => {
  const incoming = useIncomingFriendRequests();
  const outgoing = useOutgoingFriendRequests();
  const respondRequest = useRespondFriendRequest();
  const toast = useToast();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleAccept = async (req) => {
    try {
      await respondRequest(req, true);
      toast('Arkadaşlık isteği kabul edildi', 'success');
    } catch (error) {
      console.error(error);
      toast('İstek kabul edilemedi', 'error');
    }
  };

  const handleReject = async (req) => {
    try {
      await respondRequest(req, false);
      toast('Arkadaşlık isteği reddedildi', 'info');
    } catch (error) {
      console.error(error);
      toast('Reddetme işlemi başarısız', 'error');
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} size="large">
        <Badge badgeContent={incoming.length} color="error">
          <PersonAddIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {incoming.length === 0 && outgoing.length === 0 ? (
          <MenuItem disabled>Bekleyen arkadaş isteği yok</MenuItem>
        ) : (
          <Box sx={{ width: 300, p: 1 }}>
            {incoming.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ px: 1, mb: 0.5 }}>Gelen İstekler</Typography>
                {incoming.map(req => (
                  <Box key={req.id} sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5 }}>
                    <ListItemAvatar>
                      <Avatar src={req.fromAvatar}>{req.fromDisplayName.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={req.fromDisplayName} sx={{ flex: 1 }} />
                    <Button size="small" color="primary" onClick={() => handleAccept(req)}>Kabul</Button>
                    <Button size="small" onClick={() => handleReject(req)}>Reddet</Button>
                  </Box>
                ))}
              </Box>
            )}
            {outgoing.length > 0 && (
              <Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ px: 1, mb: 0.5 }}>Gönderilen İstekler</Typography>
                {outgoing.map(req => (
                  <Box key={req.id} sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5 }}>
                    <ListItemAvatar>
                      <Avatar src={req.toAvatar}>{req.toDisplayName.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={req.toDisplayName} sx={{ flex: 1 }} />
                    <Button size="small" onClick={() => handleReject(req)}>İptal</Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Menu>
    </>
  );
};

export default FriendRequestsMenu; 