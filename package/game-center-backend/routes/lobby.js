// routes/lobby.js

const express = require('express');
const router = express.Router();
const lobbyController = require('../controllers/lobbyController');
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');

// validation ve rate-limit eklentileri

// Rate limiters
const createLimiter = rateLimit({ windowMs: 60*60*1000, max: 5, message: 'Çok fazla istek - saatte en fazla 5 lobby oluşturabilirsiniz.' });
const joinLimiter = rateLimit({ windowMs: 60*1000, max: 10, message: 'Çok fazla deneme - lobiye katılmayı 1 dakikada 10 ile sınırlandırdık.' });

// Lobileri Listele
router.get('/', authMiddleware, lobbyController.getLobbies);

// Lobi Oluştur
router.post(
  '/',
  authMiddleware,
  createLimiter,
  [
    body('name').notEmpty().withMessage('Lobi adı gerekli'),
    body('type').isIn(['normal','event']).withMessage('type normal veya event olmalı'),
    body('password').optional().isString(),
    body('startTime').if(body('type').equals('event')).notEmpty().isISO8601().withMessage('startTime ISO8601 formatında olmalı'),
    body('endTime').if(body('type').equals('event')).notEmpty().isISO8601().withMessage('endTime ISO8601 formatında olmalı'),
  ],
  validate,
  lobbyController.createLobby
);

// Lobi Güncelle
router.put(
  '/:id',
  authMiddleware,
  [
    body('name').optional().isString(),
    body('type').optional().isIn(['normal','event']).withMessage('type normal veya event olmalı'),
    body('password').optional().isString(),
    body('startTime').if(body('type').equals('event')).optional().isISO8601(),
    body('endTime').if(body('type').equals('event')).optional().isISO8601(),
  ],
  validate,
  lobbyController.updateLobby
);

// Lobi Sil
router.delete('/:id', authMiddleware, lobbyController.deleteLobby);

// Lobiye Katıl
router.post(
  '/join',
  authMiddleware,
  joinLimiter,
  [
    body('lobbyId').notEmpty().withMessage('lobbyId gerekli'),
    body('password').optional().isString(),
  ],
  validate,
  lobbyController.joinLobby
);

// Lobi’den Çık
router.post(
  '/leave',
  authMiddleware,
  [ body('lobbyId').notEmpty().withMessage('lobbyId gerekli') ],
  validate,
  lobbyController.leaveLobby
);

module.exports = router;