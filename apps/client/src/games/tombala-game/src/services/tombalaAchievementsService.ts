import { collection, doc, setDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Kullanıcıya ait rozet kazandırma (achievement unlock)
 */
export async function unlockTombalaAchievement(userId: string, achievement: { id: string; title: string }) {
  const achRef = doc(db, 'users', userId, 'tombalaAchievements', achievement.id);
  await setDoc(achRef, {
    title: achievement.title,
    unlockedAt: serverTimestamp(),
  });
}

/**
 * Kullanıcının tüm tombala rozetlerini (başarımlarını) getirir
 */
export async function getUserTombalaAchievements(userId: string): Promise<Array<{ id: string; title: string; unlockedAt: any }>> {
  const achQ = query(collection(db, 'users', userId, 'tombalaAchievements'));
  const snap = await getDocs(achQ);
  return snap.docs.map(docSnap => {
    const data = docSnap.data();
    return { id: docSnap.id, title: data.title as string, unlockedAt: data.unlockedAt };
  });
} 