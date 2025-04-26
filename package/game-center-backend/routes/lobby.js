// routes/lobby.js

const express = require('express');
const router = express.Router();
const lobbyController = require('../controllers/lobbyController');
const authMiddleware = require('../middleware/authMiddleware');

// Lobileri Listele
router.get('/', authMiddleware, lobbyController.getLobbies);

// Lobi Oluştur
router.post('/', authMiddleware, lobbyController.createLobby);

// Lobi Güncelle
router.put('/:id', authMiddleware, lobbyController.updateLobby);

// Lobi Sil
router.delete('/:id', authMiddleware, lobbyController.deleteLobby);

// Lobiye Katıl
router.post('/join', authMiddleware, lobbyController.joinLobby);

module.exports = router;