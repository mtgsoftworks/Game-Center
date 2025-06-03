import { useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from './useAuth';

export default function useStartChat() {
  const user = useAuth();

  return useCallback(async (otherUserId) => {
    if (!user) throw new Error('User not authenticated');

    const chatsRef = collection(db, 'chats');
    // Mevcut sohbetleri kontrol et
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));
    const snapshot = await getDocs(q);
    const existing = snapshot.docs.find(doc => {
      const parts = doc.data().participants;
      return parts.includes(otherUserId) && parts.length === 2;
    });
    if (existing) {
      return existing.id;
    }
    // Yeni sohbet oluştur
    const newChat = await addDoc(chatsRef, {
      participants: [user.uid, otherUserId],
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
    });
    return newChat.id;
  }, [user]);
} 