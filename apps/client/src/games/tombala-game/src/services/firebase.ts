// Firebase App, Auth ve Firestore modüllerini import eder
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// firebaseConfig: Ortam değişkenlerinden okunan Firebase ayarlarını tutar
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Optional
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,     // Added for clarity, though Firestore is primary
};

// Firebase uygulamasını başlatır
const app = initializeApp(firebaseConfig);

// Firebase Authentication ve Firestore servislerini başlatır
const auth = getAuth(app);
const db = getFirestore(app);

// Google oturum açma sağlayıcısı oluşturur
const googleProvider = new GoogleAuthProvider();

// Uygulamanın diğer bölümlerinde kullanmak üzere servisleri export eder
export { app, auth, db, googleProvider };