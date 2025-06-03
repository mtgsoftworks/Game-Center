import { useState, useEffect } from 'react';
import { subscribeRooms, createRoom } from '../services/chatService';

export default function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const createNewRoom = async (name) => {
    setLoading(true);
    try {
      return await createRoom(name);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeRooms((list) => setRooms(list));
    return () => unsubscribe();
  }, []);

  return { rooms, createNewRoom, loading };
}
