import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, addDoc, getDocs, updateDoc, doc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from './useAuth';

// Gelen arkadaşlık isteklerini dinler
export function useIncomingFriendRequests() {
  const user = useAuth();
  const [incoming, setIncoming] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'friendRequests'),
      where('to', '==', user.uid),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncoming(reqs);
    });
    return unsub;
  }, [user]);

  return incoming;
}

// Giden arkadaşlık isteklerini dinler
export function useOutgoingFriendRequests() {
  const user = useAuth();
  const [outgoing, setOutgoing] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'friendRequests'),
      where('from', '==', user.uid),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOutgoing(reqs);
    });
    return unsub;
  }, [user]);

  return outgoing;
}

// Arkadaşlık isteği gönderir
export function useSendFriendRequest() {
  const user = useAuth();
  return useCallback(async (otherUser) => {
    if (!user) throw new Error('Kullanıcı oturum açmamış');
    // Mevcut giden istekleri kontrol et
    const q = query(
      collection(db, 'friendRequests'),
      where('from', '==', user.uid),
      where('to', '==', otherUser.id),
      where('status', '==', 'pending')
    );
    const snap = await getDocs(q);
    if (!snap.empty) throw new Error('İstek zaten gönderildi');
    // Yeni istek oluştur
    await addDoc(collection(db, 'friendRequests'), {
      from: user.uid,
      fromDisplayName: user.displayName || user.email,
      fromAvatar: user.photoURL || null,
      to: otherUser.id,
      toDisplayName: otherUser.displayName || otherUser.email,
      toAvatar: otherUser.avatarUrl || null,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return true;
  }, [user]);
}

// Arkadaşlık isteğine yanıt verir
export function useRespondFriendRequest() {
  const user = useAuth();
  const sendFriend = async (request, accept) => {
    const reqRef = doc(db, 'friendRequests', request.id);
    await updateDoc(reqRef, { status: accept ? 'accepted' : 'rejected', respondedAt: serverTimestamp() });
    if (accept) {
      // Her iki kullanıcıya da friends alanına ekle
      const userRef = doc(db, 'users', user.uid);
      const fromRef = doc(db, 'users', request.from);
      // updateDoc but arrayUnion
      await updateDoc(userRef, { friends: arrayUnion(request.from) });
      await updateDoc(fromRef, { friends: arrayUnion(user.uid) });
    }
  };
  return useCallback(sendFriend, [user]);
} 