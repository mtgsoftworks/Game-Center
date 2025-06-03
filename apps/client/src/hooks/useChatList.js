import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from './useAuth';

export default function useChatList() {
  const user = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChats(data);
        setLoading(false);
      },
      (err) => {
        console.error('useChatList error:', err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user, retryCount]);

  const retry = useCallback(() => {
    setRetryCount(count => count + 1);
  }, []);

  return { chats, loading, error, retry };
} 