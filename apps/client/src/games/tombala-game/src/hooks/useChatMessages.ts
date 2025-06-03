import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ChatMessage } from '../types/chat';

export function useChatMessages(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    const messagesRef = collection(db, 'gameRooms', roomId, 'chatMessages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, {
      next: snapshot => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach(doc => msgs.push({ id: doc.id, ...doc.data() } as ChatMessage));
        setMessages(msgs);
        setLoading(false);
      },
      error: err => {
        console.error('Error fetching chat messages:', err);
        setError(err);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  return { messages, loading, error };
} 