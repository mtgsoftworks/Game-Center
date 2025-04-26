// routes/auth.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');

const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const { check } = require('express-validator');

// Rate Limiting Ayarı (IP başına 15 dakika içinde en fazla 5 istek)
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Çok fazla şifre sıfırlama isteğinde bulundunuz, lütfen daha sonra tekrar deneyin.',
  });
  
  router.post(
    '/send-reset-code',
    resetLimiter,
    [check('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz.')],
    authController.sendResetCode
  );
  
  router.post(
    '/reset-password',
    [
      check('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz.'),
      check('resetCode').notEmpty().withMessage('Doğrulama kodu gereklidir.'),
      check('newPassword').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır.'),
    ],
    authController.resetPassword
  );

// Giriş Yap
router.post('/login', authController.login);

// Kayıt Ol
router.post('/register', authController.register);

// Kullanıcı Bilgisi Al
router.get('/user', authMiddleware, authController.getUser);

// E-posta Doğrulama
router.post('/verify-email', authController.verifyEmail);

module.exports = router;