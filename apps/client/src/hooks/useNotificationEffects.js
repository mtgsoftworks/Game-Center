import { useEffect, useRef, useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

export default function useNotificationEffects() {
  const { toasts } = useContext(NotificationContext);
  const originalTitle = useRef(document.title);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/notification.mp3');
    }
  }, []);

  // On new toast while tab hidden
  useEffect(() => {
    if (document.hidden && toasts.length > 0) {
      document.title = `(${toasts.length}) ${originalTitle.current}`;
      const link = document.querySelector("link[rel*='icon']");
      if (link) link.href = '/favicon-unread.ico';
      audioRef.current.play().catch(() => {});
    }
  }, [toasts]);

  // Restore on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        document.title = originalTitle.current;
        const link = document.querySelector("link[rel*='icon']");
        if (link) link.href = '/favicon.ico';
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
} 