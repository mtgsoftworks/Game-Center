const { db } = require('../utils/firebase');

/**
 * GET /api/games/stats/aggregate?game=<game>&from=<ISO>&to=<ISO>
 * Aggregated statistics for a given game and date range
 */
exports.aggregateStats = async (req, res) => {
  try {
    const { game, from, to } = req.query;
    if (!game) return res.status(400).json({ message: 'game parametre zorunlu.' });
    const collectionName = game === 'tombala' ? 'tombalaStats' : 'game2048Stats';
    let ref = db.collection(collectionName);
    if (from) ref = ref.where('playedAt', '>=', new Date(from));
    if (to) ref = ref.where('playedAt', '<=', new Date(to));
    const snap = await ref.get();
    const data = snap.docs.map(d => d.data());
    const count = data.length;
    const scores = data.map(d => d.score || 0);
    const durations = data.map(d => d.duration || 0);
    const totalScore = scores.reduce((sum, s) => sum + s, 0);
    const avgScore = count ? totalScore / count : 0;
    const minScore = scores.length ? Math.min(...scores) : 0;
    const maxScore = scores.length ? Math.max(...scores) : 0;
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const avgDuration = count ? totalDuration / count : 0;
    return res.json({ count, totalScore, avgScore, minScore, maxScore, totalDuration, avgDuration });
  } catch (err) {
    console.error('aggregateStats error:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}; 