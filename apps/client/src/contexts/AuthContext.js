import React, { createContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService, getCurrentUser, googleLogin as googleLoginService } from '../services/authService';
import auth from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firebase SDK auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          // Backend üzerinden kullanıcı profilini al
          const profile = await getCurrentUser();
          if (profile) {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: profile.name });
            localStorage.setItem('user', JSON.stringify({ ...profile, idToken }));
          } else {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName });
          }
        } catch {
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Client-side Firebase auth for Firestore permissions
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      // E-posta doğrulama kontrolü
      if (!userCred.user.emailVerified) {
        await firebaseSignOut(auth);
        throw new Error('Email adresiniz doğrulanmamış. Lütfen e-postanızı doğrulayın.');
      }
      // Backend oturumu için login
      const data = await loginService(email, password);
      setUser({ uid: data.uid, email: data.email, name: data.name });
      setToken(data.idToken);
      localStorage.setItem('user', JSON.stringify(data));
      setError(null);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Backend logout ve client-side sign out
    await logoutService();
    await firebaseSignOut(auth);
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
  };

  const googleLogin = async (idToken) => {
    setLoading(true);
    try {
      const data = await googleLoginService(idToken);
      setUser({ uid: data.uid, email: data.email, name: data.name });
      setToken(data.idToken);
      localStorage.setItem('user', JSON.stringify(data));
      setError(null);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext; 