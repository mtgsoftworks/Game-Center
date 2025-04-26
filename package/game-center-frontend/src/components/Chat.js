// src/components/Chat.js
import React, { useState, useEffect } from 'react';
import { Paper, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { connectWebSocket, sendMessage } from '../utils/websocket';

function Chat({ channel }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  useEffect(() => {
    const socket = connectWebSocket(channel, (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
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
        {messages.map((msg, index) => (
          <ListItem key={index}>
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