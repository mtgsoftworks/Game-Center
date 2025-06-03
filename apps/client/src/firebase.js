// Firebase modüler API importları
import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, GoogleAuthProvider, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);
// Auth instance oluştur ve persistence ayarla
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
// Google Auth sağlayıcısı
const googleProvider = new GoogleAuthProvider();
// Diğer servisler
const db = getFirestore(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

export { auth, googleProvider, db, rtdb, storage };
export default auth;
