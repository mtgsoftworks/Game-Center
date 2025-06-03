import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  getDocs, 
  limit, 
  startAfter, 
  addDoc, 
  doc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from './useAuth';

const GENERAL_CHAT_ID = 'GENERAL_CHAT_ROOM'; // ChatPage.js ile aynı olmalı

const getUserProfile = async (userId) => {
  if (!userId) return { name: 'Bilinmeyen Kullanıcı', avatar: null };
  try {
    const userDocRef = doc(db, 'users', userId); 
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return {
        name: userData.displayName || 'Bilinmeyen Kullanıcı',
        avatar: userData.photoURL || null, 
      };
    }
    return { name: 'Bilinmeyen Kullanıcı', avatar: null };
  } catch (error) {
    console.error('Error fetching user profile:', userId, error);
    return { name: 'Bilinmeyen Kullanıcı', avatar: null };
  }
};

export default function useChatMessages(chatId) {
  const user = useAuth();
  const PAGE_SIZE = 20;
  const [initialMessages, setInitialMessages] = useState([]);
  const [loadedMessages, setLoadedMessages] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    setInitialMessages([]); 
    setLoadedMessages([]);  

    const isGeneralChat = chatId === GENERAL_CHAT_ID;
    const messagesCollectionName = isGeneralChat ? 'general_messages' : 'messages';
    const collectionPath = isGeneralChat ? messagesCollectionName : ['chats', chatId, messagesCollectionName];
    
    // @ts-ignore // Firebase v9 collection path uyumluluğu için
    const messagesRef = collection(db, ... (Array.isArray(collectionPath) ? collectionPath : [collectionPath]));
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(PAGE_SIZE));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => { 
        const docs = snapshot.docs;
        const msgsWithSender = await Promise.all(docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const senderProfile = await getUserProfile(data.senderId);
          return {
            id: docSnapshot.id,
            ...data,
            sender: senderProfile, 
          };
        }));
        setInitialMessages(msgsWithSender.reverse());
        setLastVisible(docs[docs.length - 1] || null);
        setHasMore(docs.length === PAGE_SIZE);
        setLoading(false);
      },
      (err) => {
        console.error('useChatMessages error:', err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [chatId, retryCount]);

  const loadMore = useCallback(async () => {
    if (!chatId || !lastVisible || loadingMore) return;
    setLoadingMore(true);
    setError(null);

    const isGeneralChat = chatId === GENERAL_CHAT_ID;
    const messagesCollectionName = isGeneralChat ? 'general_messages' : 'messages';
    const collectionPath = isGeneralChat ? messagesCollectionName : ['chats', chatId, messagesCollectionName];

    // @ts-ignore
    const messagesRef = collection(db, ... (Array.isArray(collectionPath) ? collectionPath : [collectionPath]));
    const q_more = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      startAfter(lastVisible),
      limit(PAGE_SIZE)
    );
    try {
      const snapshot = await getDocs(q_more);
      const docs = snapshot.docs;
      if (docs.length > 0) {
        const olderMsgsWithSender = await Promise.all(docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const senderProfile = await getUserProfile(data.senderId);
          return {
            id: docSnapshot.id,
            ...data,
            sender: senderProfile, 
          };
        }));
        setLoadedMessages(prev => [...olderMsgsWithSender.reverse(), ...prev]);
        setLastVisible(docs[docs.length - 1] || null);
        setHasMore(docs.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('useChatMessages loadMore error:', err);
      setError(err);
    } finally {
      setLoadingMore(false);
    }
  }, [chatId, lastVisible, loadingMore, PAGE_SIZE]);

  const retry = useCallback(() => {
    setLoadedMessages([]);
    setLastVisible(null);
    setHasMore(false);
    setRetryCount(c => c + 1);
  }, []);

  const sendMessage = useCallback(async (text, attachments = []) => {
    if (!chatId) throw new Error('Chat ID is required');
    if (!user || !user.uid) {
      console.error('User not authenticated for sending message');
      return; 
    }

    const isGeneralChat = chatId === GENERAL_CHAT_ID;
    const messagesCollectionName = isGeneralChat ? 'general_messages' : 'messages';
    const collectionPath = isGeneralChat ? messagesCollectionName : ['chats', chatId, messagesCollectionName];
    
    // @ts-ignore
    const colRef = collection(db, ... (Array.isArray(collectionPath) ? collectionPath : [collectionPath]));
    
    const messageData = {
      senderId: user.uid,
      text,
      attachments,
      timestamp: serverTimestamp(),
      // Genel sohbette readBy farklı yönetilebilir, şimdilik DM ile aynı bırakalım veya kaldıralım.
      // Şimdilik DM için bırakalım, genel için null/undefined olabilir.
      readBy: isGeneralChat ? [] : [user.uid] 
    };

    await addDoc(colRef, messageData);

    if (!isGeneralChat) {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: { senderId: user.uid, text, timestamp: serverTimestamp() },
        lastMessageAt: serverTimestamp()
      });
    }
  }, [chatId, user]);

  const markAsRead = useCallback(async (messageId) => {
    if (!chatId || chatId === GENERAL_CHAT_ID) {
      // Genel sohbette okundu bilgisi şimdilik işlenmiyor
      // Veya farklı bir mantık gerektirebilir.
      return; 
    }
    if (!user || !user.uid) return; 

    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(msgRef, { readBy: arrayUnion(user.uid) });
  }, [chatId, user]);

  const editMessage = useCallback(async (messageId, newText) => {
    if (!chatId) throw new Error('Chat ID is required');
    const isGeneralChat = chatId === GENERAL_CHAT_ID;
    const docPath = isGeneralChat
      ? ['general_messages', messageId]
      : ['chats', chatId, 'messages', messageId];
    const msgRef = doc(db, ...docPath);
    await updateDoc(msgRef, {
      text: newText,
      updatedAt: serverTimestamp(),
    });
  }, [chatId]);

  const deleteMessage = useCallback(async (messageId) => {
    if (!chatId) throw new Error('Chat ID is required');
    const isGeneralChat = chatId === GENERAL_CHAT_ID;
    const docPath = isGeneralChat
      ? ['general_messages', messageId]
      : ['chats', chatId, 'messages', messageId];
    const msgRef = doc(db, ...docPath);
    await updateDoc(msgRef, {
      deletedAt: serverTimestamp(),
    });
  }, [chatId]);

  const messages = [...loadedMessages, ...initialMessages];

  return { messages, loading, loadingMore, hasMore, loadMore, error, retry, sendMessage, markAsRead, editMessage, deleteMessage };
} 