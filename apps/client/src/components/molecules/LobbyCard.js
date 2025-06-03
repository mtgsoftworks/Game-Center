/* eslint-disable consistent-return */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Box, IconButton, Button, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { differenceInHours, formatDistanceToNowStrict } from 'date-fns';
import { motion } from 'framer-motion';
import useToast from '../../hooks/useToast';

/**
 * LobbyCard component
 * Props:
 *  - lobby: { name, isEvent, isLocked, startTime }
 *  - onJoin, onEdit, onDelete: callback functions
 */
function LobbyCard({ lobby, onJoin, onEdit, onDelete }) {
  const { t } = useTranslation();
  const toast = useToast();
  const { name, isEvent, isLocked, startTime } = lobby;
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (isEvent && startTime) {
      const update = () => {
        const now = new Date();
        const start = new Date(startTime);
        const hours = differenceInHours(start, now);
        if (hours < 24) {
          setCountdown(formatDistanceToNowStrict(start, { addSuffix: true }));
        } else {
          setCountdown('');
        }
      };
      update();
      const timer = setInterval(update, 60000);
      const startTimer = setTimeout(() => {
        toast(t('eventStarted'), 'info');
      }, new Date(startTime) - new Date());
      return () => {
        clearInterval(timer);
        clearTimeout(startTimer);
      };
    }
  }, [isEvent, startTime]);

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      sx={{
        border: isEvent ? '2px solid #1976d2' : '1px solid #ddd',
        position: 'relative',
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {name}
          </Typography>
          {isLocked && <LockIcon sx={{ ml: 1 }} aria-label={t('passwordProtected')} />}
        </Box>
        {isEvent && countdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: 8 }}
          >
            <Typography variant="body2" color="primary">
              {countdown}
            </Typography>
          </motion.div>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Tooltip title={t('join')}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={onJoin}
              aria-label={t('join')}
            >
              {t('join')}
            </Button>
          </Tooltip>
          <Tooltip title={t('editLobby')}>
            <IconButton size="small" aria-label={t('editLobby')} onClick={onEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('deleteLobby')}>
            <IconButton size="small" aria-label={t('deleteLobby')} onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}

export default LobbyCard; 