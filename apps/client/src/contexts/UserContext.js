/**
 * src/contexts/UserContext.js: Kullanıcı oturumu yönetimini sağlayan Context modülü.
 * Bu modül, uygulama genelinde oturum durumunu (mevcut kullanıcı) yönetir.
 *
 * Dışa Aktarılanlar:
 *  - UserContext: React Context objesi.
 *  - UserProvider({ children }): Oturum verilerini sağlayan Context provider bileşeni.
 *
 * İşleyiş:
 *  - useEffect ile mevcut kullanıcı bilgisi fetch edilir.
 *  - useState ile user durumu yönetilir.
 */

import React, { createContext, useState, useEffect, useMemo } from 'react';
import { getCurrentUser } from '../services/authService';

export const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Mevcut kullanıcı token'ı localStorage'da var ise kullanıcı bilgisini fetch et
    if (localStorage.getItem('user')) {
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