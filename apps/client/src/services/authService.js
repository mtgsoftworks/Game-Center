// src/services/authService.js
import axios from './api';

// Kullanıcı Girişi
export const login = (email, password) =>
  axios.post('/auth/login', { email, password }).then((response) => response.data);

// Mevcut Kullanıcı Bilgisi
export const getCurrentUser = () =>
  axios
    .get('/auth/user')
    .then((response) => response.data)
    .catch((error) => {
      // 401 Unauthorized: geçersiz token veya oturum yok
      if (error.response?.status === 401) {
        // Lokal oturum bilgisini temizle
        localStorage.removeItem('user');
        return null;
      }
      // Diğer hataları logla
      console.error('Kullanıcı bilgisi alınamadı:', error);
      return null;
    });

// Kullanıcı Kaydı
export const register = (email, password, name, captchaToken) =>
  axios
    .post('/auth/register', { email, password, name, captchaToken })
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data || 'Kayıt sırasında bir hata oluştu.';
    });

// Şifre Sıfırlama Kodu Gönderme
// Forgot-password flow: only email is required
export const sendResetCode = (email) =>
  axios.post('/auth/send-reset-code', { email });

// E-posta Doğrulama
export const verifyEmail = (email, verificationCode) =>
  axios.post('/auth/verify-email', { email, verificationCode });

// Şifreyi Sıfırlama
export const resetPassword = (email, resetCode, newPassword, confirmPassword) =>
  axios.post('/auth/reset-password', {
    email,
    resetCode,
    newPassword,
    confirmPassword,
  });

// Google social login service
export const googleLogin = (idToken) =>
  axios.post('/auth/google-login', { idToken }).then((response) => response.data);

// User logout
export const logout = () =>
  axios.post('/auth/logout').then((res) => res.data);

// Change password
export const changePassword = (currentPassword, newPassword) =>
  axios.post('/auth/change-password', { currentPassword, newPassword }).then((res) => res.data);

// Update profile (name, email)
export const updateProfile = (name, email) =>
  axios.put('/auth/profile', { name, email }).then((res) => res.data);

// Delete account
export const deleteAccount = () =>
  axios.post('/auth/delete-account').then((res) => res.data);

// Tüm fonksiyonları default export ile ihraç etmeye gerek yok, ancak isterseniz aşağıdaki gibi yapabilirsiniz:
export default {
  login,
  getCurrentUser,
  register,
  sendResetCode,
  verifyEmail,
  resetPassword,
  googleLogin,
  logout,
  changePassword,
  updateProfile,
  deleteAccount,
};