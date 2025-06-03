import { Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Timestamp;
} 