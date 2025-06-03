import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Container, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  TextField, 
  Button,
  Paper, 
  Avatar, 
  Badge,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Card,
  CardContent,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import useAuth from '../hooks/useAuth';
import useChatList from '../hooks/useChatList';
import useChatMessages from '../hooks/useChatMessages';
import { useTranslation } from 'react-i18next';
import ChatCore from '../components/ChatCore';

const GENERAL_CHAT_ID = 'GENERAL_CHAT_ROOM';

function ChatPage() {
  return (
    <Container maxWidth="lg" sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', py: 3 }}>
      <ChatCore />
    </Container>
  );
}

export default ChatPage;