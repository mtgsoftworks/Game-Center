const { db, admin } = require('../utils/firebase');

/**
 * Tombala istatistiklerini kaydetme
 * POST /api/games/tombala/stats
 */
exports.postTombalaStats = async (req, res) => {
  try {
    const { userId, score, cardsMatched, duration } = req.body;
    if (!userId || score == null) {
      return res.status(400).json({ message: 'userId ve score zorunludur.' });
    }
    const playedAt = admin.firestore.Timestamp.now();
    const data = {
      userId,
      score,
      cardsMatched: cardsMatched || 0,
      duration: duration || 0,
      playedAt,
    };
    const docRef = await db.collection('tombalaStats').add(data);
    return res.status(201).json({ id: docRef.id, ...data });
  } catch (error) {
    console.error('postTombalaStats error:', error);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

/**
 * Tombala istatistiklerini kullanıcı bazında getirme
 * GET /api/games/tombala/stats?userId=...
 */
exports.getTombalaStats = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.uid;
    if (!userId) {
      return res.status(400).json({ message: 'userId belirtilmeli.' });
    }
    const snapshot = await db.collection('tombalaStats')
      .where('userId', '==', userId)
      .orderBy('playedAt', 'desc')
      .get();
    const stats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(stats);
  } catch (error) {
    console.error('getTombalaStats error:', error);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

/**
 * Tombala liderlik tablosu: en yüksek 10 skor
 * GET /api/games/tombala/leaderboard
 */
exports.getTombalaLeaderboard = async (req, res) => {
  try {
    const snapshot = await db.collection('tombalaStats')
      .orderBy('score', 'desc')
      .limit(10)
      .get();
    const results = await Promise.all(snapshot.docs.map(async docSnap => {
      const data = docSnap.data();
      let name = data.userId;
      try {
        const userDoc = await db.collection('users').doc(data.userId).get();
        if (userDoc.exists) {
          const u = userDoc.data();
          name = u.displayName || u.username || data.userId;
        }
      } catch (e) {
        console.error('Error fetching user name for leaderboard:', e);
      }
      return { userId: data.userId, name, score: data.score };
    }));
    // RTDB'ye gerçek zamanlı liderlik tablosunu yaz
    await admin.database().ref('leaderboards/tombala').set(results);
    return res.json(results);
  } catch (error) {
    console.error('getTombalaLeaderboard error:', error);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

/**
 * Tombala achievements: kullanıcıya ait kazanılan başarımları döner
 * GET /api/games/tombala/achievements/:userId
 */
exports.getTombalaAchievements = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.uid;
    if (!userId) {
      return res.status(400).json({ message: 'userId belirtilmeli.' });
    }
    const snap = await db.collection('tombalaStats')
      .where('userId', '==', userId)
      .get();
    const stats = snap.docs.map(d => d.data());
    const count = stats.length;
    const scores = stats.map(s => s.score);
    const achievements = [];
    if (count >= 1) achievements.push({ id: 'first_game', title: 'İlk Tombala Oyunu' });
    if (count >= 10) achievements.push({ id: 'ten_games', title: '10 Tombala Oyunu' });
    const maxScore = scores.length ? Math.max(...scores) : 0;
    if (maxScore >= 100) achievements.push({ id: 'score_100', title: '100 Puan Üstü Skor' });
    if (maxScore >= 500) achievements.push({ id: 'score_500', title: '500 Puan Üstü Skor' });
    return res.json(achievements);
  } catch (error) {
    console.error('getTombalaAchievements error:', error);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}; 