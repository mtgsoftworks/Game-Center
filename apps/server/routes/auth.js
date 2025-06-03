/**
 * routes/auth.js: Kimlik doğrulama endpoint'lerini tanımlar.
 *
 * Endpoint'ler:
 *  - POST /send-reset-code: Şifre sıfırlama kodu oluşturur ve e-posta gönderir (rate limit).
 *  - POST /login: Email ve şifreyle kullanıcı girişi yapar.
 *  - POST /register: Yeni kullanıcı kaydı yapar.
 *  - GET /user: Girişli kullanıcının profil bilgisini döner.
 *  - POST /verify-email: E-posta doğrulama linki oluşturur ve gönderir.
 *  - POST /google-login: Google sosyal giriş endpoint'i.
 *  - POST /logout: Kullanıcı çıkış endpoint'i.
 *  - POST /change-password: Girişli kullanıcının şifresini değiştirir.
 *  - PUT /profile: Girişli kullanıcının profil bilgilerini günceller.
 *  - POST /delete-account: Girişli kullanıcının hesabını siler.
 */

// routes/auth.js: Kimlik doğrulama işlemlerine ait tüm HTTP endpoint'lerini tanımlar
// - /send-reset-code: Şifre sıfırlama linki üretir ve e-posta gönderir (rate limit ile korunur)
// - /login: Email ve şifre ile kullanıcı girişi yapar
// - /register: Yeni kullanıcı kaydı gerçekleştirir
// - /user: Auth middleware ile girişli kullanıcının profilini döner
// - /verify-email: E-posta doğrulama linki üretir ve gönderir
// - /google-login: Google sosyal giriş endpoint'i
// - /logout: Kullanıcı çıkış endpoint'i
// - /change-password: Girişli kullanıcının şifresini değiştirir
// - /profile: Girişli kullanıcının profil bilgilerini günceller
// - /delete-account: Girişli kullanıcının hesabını siler

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
  [
    check('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz.'),
  ],
  authController.sendResetCode // Controller fonksiyonu
);

// POST /login: Email ve şifre ile kullanıcı girişi
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz.'),
    check('password').notEmpty().withMessage('Şifre gereklidir.'),
  ],
  authController.login
);

// POST /register: Yeni kullanıcı kaydı
router.post(
  '/register',
  [
    check('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz.'),
    check('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı.'),
    check('name').notEmpty().withMessage('İsim gereklidir.'),
  ],
  authController.register
);

// Google social login endpoint
router.post('/google-login', authController.googleLogin);

// POST /logout: Kullanıcı çıkış endpoint'i
router.post('/logout', authController.logout);

// GET /user: Girişli kullanıcının profil bilgisini döner
router.get('/user', authMiddleware, authController.getUser);

// POST /verify-email: E-posta doğrulama linki oluştur ve gönder
router.post('/verify-email', authController.verifyEmail);

// POST /reset-password: Şifre sıfırlama kodu ve yeni şifre ile hesap şifresini günceller
router.post(
  '/reset-password',
  [
    check('resetCode').notEmpty().withMessage('Doğrulama kodu gereklidir.'),
    check('newPassword').isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalı.'),
  ],
  authController.resetPassword
);

// POST /change-password: Girişli kullanıcının şifresini değiştirir
router.post('/change-password', authMiddleware, authController.changePassword);

// PUT /profile: Update user's name and email
router.put('/profile', authMiddleware, authController.updateProfile);

// POST /delete-account: Delete user's account and profile
router.post('/delete-account', authMiddleware, authController.deleteAccount);

module.exports = router;