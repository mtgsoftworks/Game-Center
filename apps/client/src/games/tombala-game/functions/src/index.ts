import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Firebase Admin SDK inicializasyonu
admin.initializeApp();
const db = admin.firestore();

// Zamanlanmış fonksiyon: her saatte bir çalışır, süresi geçen lobileri kapatır
export const closeExpiredRooms = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();
  const eightHoursAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - 8 * 3600 * 1000);

  // Normal lobiler: creatorLeftAt timestamp'ı 8 saatten eskiyse kapat
  const normalSnap = await db.collection('gameRooms')
    .where('status', '==', 'waiting')
    .where('creatorLeftAt', '<=', eightHoursAgo)
    .get();
  for (const docSnap of normalSnap.docs) {
    await docSnap.ref.update({ status: 'closed' });
  }

  // Etkinlik lobileri: endTime geçmişse kapat
  const eventSnap = await db.collection('gameRooms')
    .where('status', '==', 'waiting')
    .where('endTime', '<=', now)
    .get();
  for (const docSnap of eventSnap.docs) {
    await docSnap.ref.update({ status: 'closed' });
  }

  return null;
}); 