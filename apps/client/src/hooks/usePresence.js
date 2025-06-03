import { useEffect } from 'react';
import { ref, onValue, set, onDisconnect } from 'firebase/database';
import { rtdb } from '../firebase';
import useAuth from './useAuth';

// Kullanıcı çevrimdışı/çevrimiçi durumunu RTDB'de yönetir
export default function usePresence() {
  const user = useAuth();

  useEffect(() => {
    if (!user) return;
    const userStatusRef = ref(rtdb, '/status/' + user.uid);
    const connectedRef = ref(rtdb, '.info/connected');
    let heartbeatInterval;

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) {
        return;
      }
      // Disconnect durumunda offline'a geç
      onDisconnect(userStatusRef).set({ state: 'offline', last_changed: Date.now() });
      // Online olarak ayarla
      set(userStatusRef, { state: 'online', last_changed: Date.now() });
      // Her 30 saniyede heartbeat ile last_changed güncelle
      heartbeatInterval = setInterval(() => {
        set(userStatusRef, { state: 'online', last_changed: Date.now() });
      }, 30000);
    });

    return () => {
      unsubscribe();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [user]);
} 