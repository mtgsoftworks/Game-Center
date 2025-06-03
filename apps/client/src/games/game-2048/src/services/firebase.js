import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

// Firebase config - CRA için .env'de REACT_APP_ ile başlayan değişkenleri kullanın
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * 2048 oyunu istatistiğini kaydeder
 * @param {{userId?: string, score: number, duration: number, success: boolean}} stat
 * @returns {Promise<string>} Eklenen dokümanın ID'si
 */
export async function postGame2048Stat(stat) {
  const docRef = await addDoc(collection(db, 'game2048Stats'), {
    userId: stat.userId || null,
    score: stat.score,
    duration: stat.duration,
    success: stat.success,
    playedAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Kullanıcıya ait son 2048 istatistiklerini getirir
 * @param {string} userId
 * @returns {Promise<Array<any>>}
 */
export async function getGame2048Stats(userId) {
  const q = query(
    collection(db, 'game2048Stats'),
    where('userId', '==', userId),
    orderBy('playedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Genel liderlik tablosunu getirir (top 10)
 * @returns {Promise<Array<any>>}
 */
export async function getGame2048Leaderboard() {
  const q = query(
    collection(db, 'game2048Stats'),
    orderBy('score', 'desc'),
    // limit 10
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
} 