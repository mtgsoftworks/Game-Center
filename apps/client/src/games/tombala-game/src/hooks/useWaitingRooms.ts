import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface WaitingRoomData extends DocumentData {
  id: string;
  creatorName: string;
  creatorUid: string;
  createdAt: Timestamp;
  roomName?: string;
  maxPlayers?: number;
  type?: 'normal' | 'event';
  password?: string;
  startTime?: Timestamp;
  endTime?: Timestamp;
  creatorLeftAt?: Timestamp;
  status: 'waiting' | 'closed';
}

export function useWaitingRooms() {
  const [rooms, setRooms] = useState<WaitingRoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'gameRooms'),
      where('status', '==', 'waiting')
    );
    const unsubscribe = onSnapshot(
      q,
      {
        next: (snapshot) => {
          const fetched: WaitingRoomData[] = [];
          snapshot.forEach(doc => {
            fetched.push({ id: doc.id, ...doc.data() } as WaitingRoomData);
          });
          setRooms(fetched);
          setLoading(false);
        },
        error: (err) => {
          console.error('Error fetching waiting rooms:', err);
          setError(err);
          setLoading(false);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  return { rooms, loading, error };
} 