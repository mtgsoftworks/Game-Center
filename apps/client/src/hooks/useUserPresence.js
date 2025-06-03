import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

// Diğer kullanıcıların online/offline durumunu dinleyen hook
export default function useUserPresence(userId) {
  const [presence, setPresence] = useState({ state: 'offline', last_changed: null });

  useEffect(() => {
    if (!userId) return;
    const statusRef = ref(rtdb, '/status/' + userId);
    // Durum değişikliklerini dinle
    const unsubscribe = onValue(statusRef, snapshot => {
      if (snapshot.exists()) {
        setPresence(snapshot.val());
      } else {
        setPresence({ state: 'offline', last_changed: null });
      }
    });
    return () => unsubscribe();
  }, [userId]);

  return presence;
} 