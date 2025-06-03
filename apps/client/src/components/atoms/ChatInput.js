import React from 'react';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';

const ChatInput = ({ text, onChange, onSend }) => (
  <div className="flex items-center p-2 border-t">
    <input
      type="text"
      className="flex-1 border rounded px-3 py-2 mr-2 focus:outline-none"
      placeholder="Type a message..."
      aria-label="Type a message"
      value={text}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onSend()}
    />
    <IconButton color="primary" onClick={onSend}>
      <SendIcon />
    </IconButton>
  </div>
);

export default ChatInput; 