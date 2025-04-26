import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UserProvider from './contexts/UserContext'; // DOĞRU İMPORT
import './i18n'; // i18n yapılandırmasını başlatmak için

ReactDOM.createRoot(document.getElementById('root')).render(
  <UserProvider>
    <App />
  </UserProvider>
);