/**
 * src/config/firebase.ts: Firebase kimlik doğrulama sağlayıcıları ve Realtime Database örneklerini sağlar.
 * getAuth, GoogleAuthProvider ve FacebookAuthProvider ile authentication,
 * getDatabase ile Realtime Database işlemleri için önceden başlatılmış app örneğini kullanır.
 */
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { app } from '../services/firebase';

// Config is now mostly for providers and maybe specific Database instance if needed

// No need to redefine firebaseConfig here, it's in services/firebase.ts

// Get the already initialized app instance
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp(); // REMOVED - Initialization is done in services

// Auth: Firebase kimlik doğrulama işlemleri için kullanılacak örnek
export const auth = getAuth(app);

// googleProvider: Google ile sosyal giriş sağlayıcısı
export const googleProvider = new GoogleAuthProvider();
// facebookProvider: Facebook ile sosyal giriş sağlayıcısı
export const facebookProvider = new FacebookAuthProvider();

// database: Firebase Realtime Database örneği
export const database = getDatabase(app);