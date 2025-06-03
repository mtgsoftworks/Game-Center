// src/services/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  withCredentials: true, // Oturum bilgilerini iletmek için
});

// Attach Authorization header without mutating function parameter
instance.interceptors.request.use((originalConfig) => {
  const config = {
    ...originalConfig,
    headers: { ...(originalConfig.headers || {}) },
  };
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const { idToken } = JSON.parse(stored);
      if (idToken) {
        config.headers.Authorization = `Bearer ${idToken}`;
      }
    }
  } catch (e) {
    console.error('Error attaching auth header:', e);
  }
  return config;
});

export default instance;