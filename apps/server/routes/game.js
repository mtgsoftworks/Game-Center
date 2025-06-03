/**
 * routes/game.js: Oyun listeleme endpoint'lerini tanımlar.
 *
 * Endpoint'ler:
 *  - GET /: Girişli kullanıcı için geçerli tüm oyunları listeler.
 */
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');
const tombalaStatsController = require('../controllers/tombalaStatsController');
const statsController = require('../controllers/statsController');

// Oyunları Listele
router.get('/', authMiddleware, gameController.getGames);

// GET /:id - Belirli bir oyunun detaylarını döner
router.get('/:id', authMiddleware, gameController.getGameById);

// Tombala istatistiklerini kaydet
router.post('/tombala/stats', authMiddleware, tombalaStatsController.postTombalaStats);

// Tombala istatistiklerini kullanıcı bazında getir
router.get('/tombala/stats', authMiddleware, tombalaStatsController.getTombalaStats);

// Tombala liderlik tablosu
router.get('/tombala/leaderboard', authMiddleware, tombalaStatsController.getTombalaLeaderboard);

// Tombala achievements
router.get('/tombala/achievements/:userId', authMiddleware, tombalaStatsController.getTombalaAchievements);

// Genel istatistikler için aggregate endpoint
router.get('/stats/aggregate', authMiddleware, statsController.aggregateStats);

// Oyun Oluştur (Eğer yetki varsa)
// router.post('/', authMiddleware, gameController.createGame);

module.exports = router;