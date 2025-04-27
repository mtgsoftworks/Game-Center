// src/components/Chat.js
import React, { useState, useEffect } from 'react';
import { Paper, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { connectWebSocket, sendMessage } from '../utils/websocket';

function Chat({ channel }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    const socket = connectWebSocket(channel, (message) => {
      // Show browser notification if page hidden
      if (document.hidden && Notification.permission === 'granted') {
        // eslint-disable-next-line no-new
        new Notification(message.user, { body: message.text });
      }
      setMessages((prevMessages) => [...prevMessages, { ...message, id: `${Date.now()}-${Math.random()}` }]);
    });
    
    return () => {
      socket.close();
    };
  }, [channel]);
  
  const handleSend = () => {
    sendMessage(channel, input);
    setInput('');
  };
  
  return (
    <Paper>
      <List>
        {messages.map((msg) => (
          <ListItem key={msg.id}>
            <ListItemText primary={msg.user} secondary={msg.text} />
          </ListItem>
        ))}
      </List>
      <TextField value={input} onChange={(e) => setInput(e.target.value)} fullWidth />
      <Button onClick={handleSend}>Gönder</Button>
    </Paper>
  );
}

export default Chat;