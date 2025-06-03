/**
 * controllers/authController.js: Kullanıcı kimlik doğrulama işlemleri.
 * Bu controller, kullanıcı kaydı, giriş, profil alma, e-posta doğrulama ve şifre sıfırlama işlevlerini içerir.
 *
 * Fonksiyonlar:
 *  - register(req, res): Yeni kullanıcı kaydeder ve e-posta doğrulama linki gönderir.
 *  - login(req, res): Email/şifre ile oturum açar ve token yönetimini yapar.
 *  - getUser(req, res): Doğrulanmış kullanıcının profil bilgisini döner.
 *  - verifyEmail(req, res): E-posta doğrulama kodlarını yönetir.
 *  - sendResetCode(req, res): Şifre sıfırlama kodu gönderir.
 *  - resetPassword(req, res): Şifre sıfırlama işlemini gerçekleştirir.
 */

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
const { validationResult } = require('express-validator');

/**
 * register: Yeni kullanıcı kaydı
 * @param {Object} req.body - { email, password, name }
 * @param {Object} res - Express yanıt objesi
 */
exports.register = async (req, res) => {
  // İstek validasyonu
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  const { email, password, name } = req.body;
  try {
    const { data } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    const uid = data.localId;
    // Firestore'a kullanıcı profili kaydediliyor
    await db.collection('users').doc(uid).set({ email, name, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    // OOB REST API ile doğrulama e-postası gönderiliyor
    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`,
      { requestType: 'VERIFY_EMAIL', idToken: data.idToken }
    );
    // HTTP-only auth token çerezi ayarlanıyor ve kullanıcı bilgisi dönülüyor
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

  // Pre-check verification: avoid rate limits if unverified
  try {
    const preUser = await admin.auth().getUserByEmail(email);
    if (!preUser.emailVerified) {
      return res.status(403).json({ message: 'Hesabınız doğrulanmamış. Lütfen e-postanızı doğrulayın.' });
    }
  } catch {
    // proceed even if user not found
  }

  try {
    const { data } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    const uid = data.localId;
    const doc = await db.collection('users').doc(uid).get();
    const profile = doc.exists ? doc.data() : {};
    // HTTP-only auth token çerezi ayarlanıyor
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
 * getUser: Girişli kullanıcının profil bilgilerini Firestore'dan alır
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
      // Email doğrulama onayı işleniyor
      await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
        { oobCode }
      );
      return res.json({ message: 'E-posta başarıyla doğrulandı.' });
    }
    if (!idToken) {
      return res.status(400).json({ message: 'idToken gereklidir.' });
    }
    // Doğrulama e-postası yeniden gönderiliyor
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
  // İstek validasyon sonuçlarını kontrol et
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Geçerli bir e-posta adresi giriniz.', errors: errors.array() });
  }
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
  // İstek validasyonu
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
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

/**
 * logout: Clears HTTP-only auth cookie
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Logged out.' });
};

/**
 * changePassword: Change authenticated user's password
 */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    // Reauthenticate user
    const { data: loginData } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email: req.user.email, password: currentPassword, returnSecureToken: true }
    );
    // Update password
    const { data: updateData } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
      { idToken: loginData.idToken, password: newPassword, returnSecureToken: true }
    );
    // Set new token cookie
    res.cookie('token', updateData.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json({ message: 'Password updated.' });
  } catch (error) {
    console.error('Change password error:', error.response?.data || error);
    res.status(400).json({ message: 'Password change failed.', error: error.response?.data });
  }
};

/**
 * updateProfile: Update user's name and email
 */
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const uid = req.user.uid;
  try {
    const idToken = req.cookies.token;
    // Update Firestore name
    await db.collection('users').doc(uid).update({ name });
    // Update email if changed
    if (email && email !== req.user.email) {
      const { data: updateData } = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
        { idToken, email, returnSecureToken: true }
      );
      res.cookie('token', updateData.idToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    }
    // Get updated profile
    const doc = await db.collection('users').doc(uid).get();
    res.json({ uid, email: email || req.user.email, ...doc.data() });
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error);
    res.status(400).json({ message: 'Profile update failed.', error: error.response?.data });
  }
};

/**
 * deleteAccount: Delete user's account and profile
 */
exports.deleteAccount = async (req, res) => {
  const uid = req.user.uid;
  try {
    await admin.auth().deleteUser(uid);
    await db.collection('users').doc(uid).delete();
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.json({ message: 'Account deleted.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Account deletion failed.' });
  }
};

// Google social login handler
/**
 * googleLogin: handle Google social login
 * @param {Object} req.body - { idToken }
 */
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;
  try {
    // Verify the Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      // Create user profile if new
      await db.collection('users').doc(uid).set({
        email: decoded.email,
        name: decoded.name || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    const profile = userDoc.exists ? userDoc.data() : { name: decoded.name, email: decoded.email };
    // Set HTTP-only cookie
    res.cookie('token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return res.json({ uid, email: decoded.email, name: profile.name, idToken });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(400).json({ message: 'Google login failed.', error: error.message });
  }
};