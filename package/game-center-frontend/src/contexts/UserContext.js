// src/contexts/UserContext.js

import React, { createContext, useState, useEffect, useMemo } from 'react';
import { getCurrentUser } from '../services/authService';

export const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Auto-login only if no stored credentials
    if (!localStorage.getItem('credentials')) {
      const fetchUser = async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      };
      fetchUser();
    }
  }, []);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;