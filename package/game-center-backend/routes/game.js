// routes/game.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

// Oyunları Listele
router.get('/', authMiddleware, gameController.getGames);

// Oyun Oluştur (Eğer yetki varsa)
// router.post('/', authMiddleware, gameController.createGame);

module.exports = router;