import React from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import useAuth from '../../hooks/useAuth';
import useUserPresence from '../../hooks/useUserPresence';

const ChatListItem = ({ chat, onSelect, selected }) => {
  const user = useAuth();
  const otherUserId = chat.participants.find(id => id !== user.uid);
  const presence = useUserPresence(otherUserId);
  const name = chat.name || chat.id;
  const lastMsg = chat.lastMessage?.text || '';
  const time = chat.lastMessageAt?.toDate
    ? chat.lastMessageAt.toDate().toLocaleTimeString()
    : '';

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect(chat.id)}
      onKeyDown={e => e.key === 'Enter' && onSelect(chat.id)}
      role="button"
      tabIndex={0}
      className={`flex items-center w-full text-left px-4 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-main ${selected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        color={presence.state === 'online' ? 'success' : 'default'}
      >
        <Avatar>{name.charAt(0)}</Avatar>
      </Badge>
      <Box className="ml-3 flex-1">
        <Typography variant="subtitle1" noWrap>{name}</Typography>
        <Typography variant="body2" color="textSecondary" noWrap>{lastMsg}</Typography>
      </Box>
      <Typography variant="caption" color="textSecondary">{time}</Typography>
    </Box>
  );
};

export default ChatListItem; 