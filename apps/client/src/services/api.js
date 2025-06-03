import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((originalConfig) => {
  const config = {
    ...originalConfig,
    headers: { ...(originalConfig.headers || {}) },
  };
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const { idToken, token } = JSON.parse(stored);
      const accessToken = idToken || token;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
  } catch (e) {
    console.error('Error attaching auth header:', e);
  }
  return config;
});

// 401 hatası (token süresi doldu) durumunda token yenileyip isteği tekrar dene
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401) {
      // Eğer GET /auth/user isteği ise, sadece oturum bilgisini temizle ve error'u reject et
      if (originalRequest.url?.endsWith('/auth/user')) {
        localStorage.removeItem('user');
        return Promise.reject(error);
      }
      // Diğer durumlar için token yenilemeyi dene
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const newIdToken = await currentUser.getIdToken(true);
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, idToken: newIdToken }));
            originalRequest.headers.Authorization = `Bearer ${newIdToken}`;
            return api(originalRequest);
          }
        } catch (e) {
          console.error('Token refresh failed or no firebase user:', e);
        }
      }
      // Token yenileme yapılamadıysa oturumu sonlandır ve login sayfasına yönlendir
      try {
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } catch (e) {
        console.error('Error during forced logout:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 