// routes/auth.js: Kimlik doğrulama işlemlerine ait tüm HTTP endpoint’lerini tanımlar
// - /send-reset-code: Şifre sıfırlama linki üretir ve e-posta gönderir (rate limit ile korunur)
// - /reset-password: Gelen kod ve yeni şifre ile Firebase şifresini günceller
// - /login: Email ve şifre ile kullanıcı girişi yapar
// - /register: Yeni kullanıcı kaydı gerçekleştirir
// - /user: Auth middleware ile girişli kullanıcının profilini döner
// - /verify-email: E-posta doğrulama linki üretir ve gönderir

const express = require('express'); // Express router oluşturmak için
const router = express.Router(); // Yeni router instance
const authMiddleware = require('../middleware/authMiddleware'); // Kimlik doğrulama kontrolü middleware
const axios = require('axios'); // HTTP istekleri yapmak için

const authController = require('../controllers/authController'); // Auth işlemlerini yöneten controller
const rateLimit = require('express-rate-limit'); // IP başına istek sınırı için
const { check } = require('express-validator'); // İstek doğrulaması için

// Rate limiting: IP başına 15 dakikada en fazla 5 şifre sıfırlama isteği
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // Maksimum 5 istek
  message: 'Çok fazla şifre sıfırlama isteğinde bulundunuz, lütfen daha sonra tekrar deneyin.',
});

// POST /send-reset-code: Şifre sıfırlama linki oluştur ve mail ile gönder
router.post(
  '/send-reset-code',
  resetLimiter, // Rate limit uygulanır
  [check('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz.')], // Email doğrulaması
  authController.sendResetCode // Controller fonksiyonu
);

// POST /reset-password: OOB kodunu ve yeni şifreyi alıp Firebase şifresini günceller
router.post(
  '/reset-password',
  [
    check('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz.'),
    check('resetCode').notEmpty().withMessage('Doğrulama kodu gereklidir.'),
    check('newPassword').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır.'),
  ],
  authController.resetPassword
);

// POST /login: Email ve şifre ile kullanıcı girişi
router.post('/login', authController.login);

// POST /register: Yeni kullanıcı kaydı
router.post('/register', authController.register);

// GET /user: Girişli kullanıcının profil bilgisini döner
router.get('/user', authMiddleware, authController.getUser);

// POST /verify-email: E-posta doğrulama linki oluştur ve gönder
router.post('/verify-email', authController.verifyEmail);

module.exports = router;