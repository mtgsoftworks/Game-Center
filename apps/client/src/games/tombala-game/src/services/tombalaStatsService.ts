import { collection, addDoc, query, where, orderBy, limit, getDocs, getDoc, doc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Tombala oyunu için istatistik gönder
 */
export async function postTombalaStats({ userId, score, cardsMatched = 0, duration = 0, success = false }: { userId: string; score: number; cardsMatched?: number; duration?: number; success?: boolean }) {
  const data = { userId, score, cardsMatched, duration, playedAt: serverTimestamp(), success };
  const colRef = collection(db, 'tombalaStats');
  const docRef = await addDoc(colRef, data);
  // Kullanıcı XP'sini güncelle (kazanç/kayıp)
  try {
    const userRef = doc(db, 'users', userId);
    const xpChange = success ? 10 : -5;
    await updateDoc(userRef, { xp: increment(xpChange) });
  } catch (err) {
    console.error('Error updating user XP:', err);
  }
  return { id: docRef.id, ...data };
}

/**
 * Tombala leaderboard (en yüksek skor) getirir
 */
export async function getTombalaLeaderboard() {
  const q = query(
    collection(db, 'tombalaStats'),
    orderBy('score', 'desc'),
    limit(10)
  );
  const snap = await getDocs(q);
  const results = [] as Array<{ userId: string; name: string; score: number }>
  for (const docSnap of snap.docs) {
    const data: any = docSnap.data();
    // Kullanıcı profili için users koleksiyonundan isim al
    let name = data.userId;
    try {
      const userDoc = await getDoc(doc(db, 'users', data.userId));
      if (userDoc.exists()) {
        const u = userDoc.data();
        name = u.displayName || u.username || data.userId;
      }
    } catch (e) {
      console.error('Error fetching user for leaderboard:', e);
    }
    results.push({ userId: data.userId, name, score: data.score });
  }
  return results;
}

/**
 * Tombala achievements: kullanıcıya ait kazanılan başarımları hesaplar
 */
export async function getTombalaAchievements(userId: string) {
  // Tüm kullanıcıya ait istatistikleri çek
  const snap = await getDocs(query(
    collection(db, 'tombalaStats'),
    where('userId', '==', userId)
  ));
  const stats = snap.docs.map(docSnap => docSnap.data());
  const count = stats.length;
  const scores = stats.map(s => (s as any).score);

  const achievements = [] as Array<{ id: string; title: string; description: string; unlockedAt: any }>
  const now = serverTimestamp();

  if (count >= 1) {
    achievements.push({ id: 'first_game', title: 'İlk Tombala Oyunu', description: 'İlk oyunu tamamla', unlockedAt: now });
  }
  if (count >= 5) {
    achievements.push({ id: 'five_games', title: '5 Tombala Oyunu', description: '5 oyunu tamamla', unlockedAt: now });
  }
  if (count >= 10) {
    achievements.push({ id: 'ten_games', title: '10 Tombala Oyunu', description: '10 oyunu tamamla', unlockedAt: now });
  }
  const maxScore = scores.length ? Math.max(...scores) : 0;
  if (maxScore >= 100) {
    achievements.push({ id: 'score_100', title: '100 Puan Üstü Skor', description: '100 puan ve üzeri skor', unlockedAt: now });
  }
  if (maxScore >= 200) {
    achievements.push({ id: 'score_200', title: '200 Puan Üstü Skor', description: '200 puan ve üzeri skor', unlockedAt: now });
  }
  if (maxScore >= 500) {
    achievements.push({ id: 'score_500', title: '500 Puan Üstü Skor', description: '500 puan ve üzeri skor', unlockedAt: now });
  }
  return achievements;
} 