// src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Kullanıcı Girişi
export const login = (email, password) =>
  axios
    .post(
      `${API_URL}/auth/login`,
      { email, password },
      { withCredentials: true }
    )
    .then((response) => response.data);

// Mevcut Kullanıcı Bilgisi
export const getCurrentUser = () =>
  axios
    .get(`${API_URL}/auth/user`, { withCredentials: true })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Kullanıcı bilgisi alınamadı:', error);
      return null;
    });

// Kullanıcı Kaydı
export const register = (email, password, name) =>
  axios
    .post(
      `${API_URL}/auth/register`,
      { email, password, name },
      { withCredentials: true }
    )
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data || 'Kayıt sırasında bir hata oluştu.';
    });

// Şifre Sıfırlama Kodu Gönderme
export const sendResetCode = (email, token) =>
  axios.post(`${API_URL}/auth/send-reset-code`, { email, token });

// E-posta Doğrulama
export const verifyEmail = (email, verificationCode) =>
  axios.post(`${API_URL}/auth/verify-email`, { email, verificationCode });

// Şifreyi Sıfırlama
export const resetPassword = (email, resetCode, newPassword, confirmPassword) =>
  axios.post(`${API_URL}/auth/reset-password`, {
    email,
    resetCode,
    newPassword,
    confirmPassword,
  });

// Tüm fonksiyonları default export ile ihraç etmeye gerek yok, ancak isterseniz aşağıdaki gibi yapabilirsiniz:
export default {
  login,
  getCurrentUser,
  register,
  sendResetCode,
  resetPassword,
  // Diğer metotlar...
};