// controllers/authController.js: Kullanıcı kimlik doğrulama işlemleri
// - register: Yeni kullanıcı kaydı, Firestore profili oluşturma, e-posta doğrulama linki gönderimi
// - login: Email/şifre ile kimlik doğrulama, token ve profil bilgisi döner
// - getUser: Auth middleware sonrası kullanıcı profil bilgisini getirir
// - verifyEmail: E-posta doğrulama linki yeniden üretir ve gönderir
// - sendResetCode: Şifre sıfırlama linki üretir ve e-posta gönderir
// - resetPassword: OOB kodu ve yeni şifre ile Firebase şifresini günceller

const axios = require('axios');
const { admin, db } = require('../utils/firebase');
// sendEmail utility kaldırıldı; email gönderimleri Firebase OOB REST API veya client üzerinden yapılmalı
const API_KEY = process.env.FIREBASE_API_KEY;

/**
 * register: Yeni kullanıcı kaydı
 * @param {Object} req.body - { email, password, name }
 * @param {Object} res - Express yanıt objesi
 */
exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const { data } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    const uid = data.localId;
    // Save user profile
    await db.collection('users').doc(uid).set({ email, name, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    // send verification email via OOB REST API
    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`,
      { requestType: 'VERIFY_EMAIL', idToken: data.idToken }
    );
    // Set HTTP-only auth token cookie and return user info
    res.cookie('token', data.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return res.status(201).json({ uid, email, name, idToken: data.idToken, refreshToken: data.refreshToken });
  } catch (error) {
    console.error('Register error:', error.response?.data || error);
    res.status(400).json({ message: 'Kayıt başarısız.', error: error.response?.data });
  }
};

/**
 * login: Mevcut kullanıcıyı email ve şifre ile oturum açtırır
 * @param {Object} req.body - { email, password }
 * @param {Object} res - Express yanıt objesi
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    const uid = data.localId;
    // Check if email is verified
    const userRecord = await admin.auth().getUser(uid);
    if (!userRecord.emailVerified) {
      return res.status(403).json({ message: 'Lütfen emailinizi doğrulayın. Mailinize gelen linke tıklayarak hesabınızı doğrulayın.' });
    }
    const doc = await db.collection('users').doc(uid).get();
    const profile = doc.exists ? doc.data() : {};
    // Set HTTP-only auth token cookie
    res.cookie('token', data.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.status(200).json({ uid, email, name: profile.name, idToken: data.idToken, refreshToken: data.refreshToken });
  } catch (error) {
    console.error('Login error:', error.response?.data || error);
    res.status(400).json({ message: 'Giriş başarısız.', error: error.response?.data });
  }
};

/**
 * getUser: Girişli kullanıcının profil bilgilerini Firestore’dan alır
 * @param {Object} req - Express isteği (authMiddleware ile req.user atanır)
 * @param {Object} res - Express yanıt objesi
 */
exports.getUser = async (req, res) => {
  try {
    const uid = req.user.uid;
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    res.json({ uid, email: req.user.email, ...doc.data() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

/**
 * verifyEmail: E-posta doğrulama linki yeniden üretir ve gönderir
 * @param {Object} req.body - { email, oobCode, idToken }
 * @param {Object} res - Express yanıt objesi
 */
exports.verifyEmail = async (req, res) => {
  const { oobCode, idToken } = req.body;
  try {
    if (oobCode) {
      // confirm email verification
      await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
        { oobCode }
      );
      return res.json({ message: 'E-posta başarıyla doğrulandı.' });
    }
    if (!idToken) {
      return res.status(400).json({ message: 'idToken gereklidir.' });
    }
    // resend verification email
    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`,
      { requestType: 'VERIFY_EMAIL', idToken }
    );
    return res.json({ message: 'Doğrulama e-postası gönderildi.' });
  } catch (error) {
    console.error('Verify email error:', error.response?.data || error);
    res.status(500).json({ message: 'E-posta gönderilemedi.', error: error.response?.data });
  }
};

/**
 * sendResetCode: Firebase REST API ile şifre sıfırlama e-postası gönderir
 * @param {Object} req.body - { email }
 * @param {Object} res - Express yanıt objesi
 */
exports.sendResetCode = async (req, res) => {
  const { email } = req.body;
  try {
    // Firebase REST: PASSWORD_RESET tipi OOB kodu gönder
    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`,
      { email, requestType: 'PASSWORD_RESET' }
    );
    res.json({ message: 'Şifre sıfırlama e-postası gönderildi.' });
  } catch (error) {
    console.error('Send reset link error:', error.response?.data || error);
    res.status(500).json({ message: 'Şifre sıfırlama e-postası gönderilemedi.', error: error.response?.data });
  }
};

/**
 * resetPassword: Gelen OOB kodu ve yeni şifre ile Firebase şifresini günceller
 * @param {Object} req.body - { newPassword, oobCode, resetCode }
 * @param {Object} res - Express yanıt objesi
 */
exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const oobCode = req.body.oobCode || req.body.resetCode;
  if (!oobCode) {
    return res.status(400).json({ message: 'Doğrulama kodu gereklidir.' });
  }
  try {
    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${API_KEY}`,
      { oobCode, newPassword }
    );
    res.json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (error) {
    console.error('Reset password error:', error.response?.data || error);
    res.status(400).json({ message: 'Şifre sıfırlama başarısız.', error: error.response?.data });
  }
};