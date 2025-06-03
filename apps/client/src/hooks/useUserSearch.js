import { useState, useEffect } from 'react';
import { collection, query, orderBy, startAt, endAt, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function useUserSearch(searchTerm) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!searchTerm) {
      setResults([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          orderBy('displayName'),
          startAt(searchTerm),
          endAt(searchTerm + '\uf8ff')
        );
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResults(users);
      } catch (error) {
        console.error('useUserSearch error:', error);
      }
    };

    fetchUsers();
  }, [searchTerm]);

  return results;
} 