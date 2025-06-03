import React, { useState } from 'react';
import { Box, TextField, Typography, Paper, Avatar, IconButton, InputAdornment } from '@mui/material';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useChatMessages } from '../../hooks/useChatMessages';
import { ChatMessage } from '../../types/chat';
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from 'react-i18next';

interface ChatProps {
  roomId: string;
}

const Chat: React.FC<ChatProps> = ({ roomId }) => {
  const { currentUser } = useAuth();
  const { messages, loading, error } = useChatMessages(roomId);
  const [newMsg, setNewMsg] = useState('');
  const { t } = useTranslation();

  const handleSend = async () => {
    if (!newMsg.trim() || !currentUser) return;
    try {
      await addDoc(collection(db, 'gameRooms', roomId, 'chatMessages'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        text: newMsg.trim(),
        timestamp: serverTimestamp(),
      });
      setNewMsg('');
    } catch (e) {
      console.error('Error sending chat message:', e);
    }
  };

  return (
    <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        {t('chat.title')}
      </Typography>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
        {loading && <Typography variant="body2">{t('chat.placeholder')}</Typography>}
        {error && <Typography variant="body2" color="error">{t('chat.error')}</Typography>}
        {messages.map((msg: ChatMessage) => {
          const isOwn = msg.userId === currentUser?.uid;
          const time = msg.timestamp?.toDate()?.toLocaleTimeString();
          return (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                flexDirection: isOwn ? 'row-reverse' : 'row',
                mb: 1,
                alignItems: 'flex-end'
              }}
            >
              <Avatar
                sx={{ width: 28, height: 28, bgcolor: isOwn ? 'primary.main' : 'grey.500', fontSize: '0.8rem' }}
              >
                {msg.userName.charAt(0).toUpperCase()}
              </Avatar>
              <Box
                sx={{
                  maxWidth: '70%',
                  bgcolor: isOwn ? 'primary.light' : 'grey.200',
                  color: 'text.primary',
                  borderRadius: 2,
                  p: 1,
                  mx: 1
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', textAlign: isOwn ? 'right' : 'left', mt: 0.5 }}
                >
                  {msg.userName} • {time}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={t('chat.placeholder')}
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSend} disabled={!newMsg.trim()}>
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
    </Paper>
  );
};

export default Chat; 