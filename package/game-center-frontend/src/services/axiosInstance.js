// src/services/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true, // Oturum bilgilerini iletmek için
});

export default instance;