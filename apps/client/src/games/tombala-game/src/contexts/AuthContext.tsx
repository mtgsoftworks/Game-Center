/**
 * src/contexts/AuthContext.tsx: Kullanıcı kimlik doğrulama durumunu yöneten Context modülü.
 * Context sağlayıcı ile token ve kullanıcı bilgisi saklanır, login/logout işlemleri kontrol edilir.
 * Uygulama kökünde AuthProvider ile sarılarak kullanılır.
 *
 * Dışa Aktarılanlar:
 *  - AuthContext: React Context nesnesi.
 *  - AuthProvider({ children }): Kimlik doğrulama bilgilerini sağlayan provider bileşeni.
 *
 * @returns {JSX.Element} Auth context provider bileşeni.
 */
// React: Context oluşturma ve state yönetimi için gerekli
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// Firebase Auth: kullanıcı durumunu dinlemek için onAuthStateChanged
import { User, onAuthStateChanged } from 'firebase/auth';
// Firebase Auth: kullanıcı durumunu dinlemek için onAuthStateChanged
import { auth } from '../services/firebase';

// AuthContextType: currentUser ve loading durumlarını tip güvenliğiyle tanımlar
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

// AuthContext: kimlik doğrulama bilgisini sağlayan React Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// useAuth: AuthContext'i tüketen özel hook, yalnızca AuthProvider içinde kullanılabilir
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth sadece AuthProvider ile kullanılabilir');
  }
  return context;
}

// AuthProviderProps arayüzü: AuthProvider bileşeninin özelliklerini tanımlar
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider: tüm uygulamayı sararak kimlik doğrulama durumunu sağlar
export function AuthProvider({ children }: AuthProviderProps) {
  // currentUser: oturum açmış kullanıcı (User) veya null
  // loading: kimlik doğrulama durumu yükleniyor mu?
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // onAuthStateChanged: Firebase auth durum değişikliklerini dinler
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
  };

  // AuthContext.Provider: alt bileşenlere auth bilgisini sunar
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}