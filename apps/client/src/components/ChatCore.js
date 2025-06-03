import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Card, CardContent, List, ListItem, ListItemText, ListItemIcon, Typography, TextField, IconButton, Avatar, Badge, Divider, CircularProgress, useTheme, alpha, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import useAuth from '../hooks/useAuth';
import useChatList from '../hooks/useChatList';
import useChatMessages from '../hooks/useChatMessages';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const GENERAL_CHAT_ID = 'GENERAL_CHAT_ROOM';

export default function ChatCore() {
  const theme = useTheme();
  const { t } = useTranslation();
  const user = useAuth();
  const { chats, loading: chatsLoading, error: chatsError, retry: retryChats } = useChatList();
  const [selectedChatId, setSelectedChatId] = useState(GENERAL_CHAT_ID);
  const { messages, loading: messagesLoading, error: messagesError, sendMessage, editMessage, deleteMessage } = useChatMessages(selectedChatId);
  const [text, setText] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChatId]);

  const handleSend = useCallback(() => {
    if (!text.trim() || !user?.uid) return;
    sendMessage(text.trim());
    setText('');
  }, [text, sendMessage, user]);

  const onEditClick = (id, currentText) => { setEditingMessage({ id, text: currentText }); };
  const onDeleteClick = (id) => { if (window.confirm(t('chatPage.confirmDelete', 'Bu mesaj silinsin mi?'))) { deleteMessage(id); } };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Chat List */}
      <Card sx={{ width: 320, overflow: 'hidden', boxShadow: theme.shadows[3], borderRadius: 2, mr: 2 }}>
        <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2, bgcolor: theme.palette.primary.main, color: 'white' }}>
            <Typography variant="h6" fontWeight="bold">{t('chatPage.chatsTitle', 'Sohbetler')}</Typography>
          </Box>
          {chatsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>
          ) : (
            <List sx={{ flex: 1, overflow: 'auto', '& .Mui-selected': { backgroundColor: alpha(theme.palette.primary.main, 0.1), borderLeft: `4px solid ${theme.palette.primary.main}` } }}>
              <ListItem button selected={selectedChatId === GENERAL_CHAT_ID} onClick={() => setSelectedChatId(GENERAL_CHAT_ID)}>
                <ListItemIcon><Avatar sx={{ bgcolor: theme.palette.primary.main }}><GroupIcon /></Avatar></ListItemIcon>
                <ListItemText primary={t('generalChat', 'Genel Sohbet')} primaryTypographyProps={{ noWrap: true }} />
              </ListItem>
              <Divider component="li" />
              {chats.map(chat => {
                const otherId = chat.participants?.find(id => id !== user.uid);
                const name = chat.name || (otherId ? otherId.substring(0,6) : t('chatPage.unknownUser', 'Bilinmeyen'));
                const isOnline = false;
                return (
                  <React.Fragment key={chat.id}>
                    <ListItem button selected={chat.id === selectedChatId} onClick={() => setSelectedChatId(chat.id)}>
                      <ListItemIcon>
                        <Badge overlap="circular" variant="dot" color={isOnline ? 'success' : 'default'}>
                          <Avatar sx={{ bgcolor: chat.id === selectedChatId ? theme.palette.primary.main : theme.palette.grey[400] }}>{name.charAt(0)}</Avatar>
                        </Badge>
                      </ListItemIcon>
                      <ListItemText primary={name} primaryTypographyProps={{ noWrap: true }} secondary={chat.lastMessage?.text || t('chatPage.noMessagesYet', 'Henüz mesaj yok')} secondaryTypographyProps={{ noWrap: true, fontSize: '0.8rem' }} />
                    </ListItem>
                    <Divider component="li" variant="inset" />
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', boxShadow: theme.shadows[3], borderRadius: 2 }}>
        <Box sx={{ p: 2, bgcolor: theme.palette.primary.main, color: 'white' }}>
          <Typography variant="h6">{selectedChatId === GENERAL_CHAT_ID ? t('generalChat', 'Genel Sohbet') : (chats.find(c => c.id === selectedChatId)?.name || '')}</Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messagesLoading ? (
            <CircularProgress size={24} />
          ) : (
            messages.map(msg => {
              const isOwn = msg.senderId === user.uid;
              const timeStamp = msg.createdAt?.toDate
                ? msg.createdAt.toDate()
                : (msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp));
              const formattedTime = timeStamp ? format(timeStamp, 'HH:mm, dd.MM.yyyy') : '';
              return (
                <Box
                  key={msg.id}
                  sx={{ display: 'flex', flexDirection: isOwn ? 'flex-end' : 'flex-start', mb: 2 }}
                >
                  <Box
                    sx={{
                      bgcolor: isOwn ? theme.palette.primary.main : theme.palette.grey[300],
                      color: isOwn ? 'white' : 'black',
                      p: 2,
                      borderRadius: '16px',
                      borderTopLeftRadius: isOwn ? '16px' : '4px',
                      borderTopRightRadius: isOwn ? '4px' : '16px',
                      maxWidth: '80%',
                      wordBreak: 'break-word'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.7, display: 'block', mb: 0.5 }}>
                      {msg.sender.name} • {formattedTime}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {msg.deletedAt ? <i>{t('chatPage.messageDeleted', 'Bu mesaj silindi')}</i> : msg.text}
                    </Typography>
                    {!msg.deletedAt && isOwn && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <IconButton size="small" onClick={() => onEditClick(msg.id, msg.text)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => onDeleteClick(msg.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
          <TextField fullWidth size="small" variant="outlined" value={text} onChange={e => setText(e.target.value)} onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} />
          <IconButton color="primary" onClick={handleSend}>
            <SendIcon />
          </IconButton>
        </Box>
      </Card>

      {editingMessage && (
        <Dialog open onClose={() => setEditingMessage(null)}>
          <DialogTitle>{t('chatPage.editMessage', 'Mesajı Düzenle')}</DialogTitle>
          <DialogContent>
            <TextField
              multiline
              fullWidth
              value={editingMessage.text}
              onChange={e => setEditingMessage({ ...editingMessage, text: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingMessage(null)}>{t('cancel', 'İptal')}</Button>
            <Button
              onClick={() => {
                editMessage(editingMessage.id, editingMessage.text);
                setEditingMessage(null);
              }}
              disabled={!editingMessage.text.trim()}
            >
              {t('save', 'Kaydet')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
} 