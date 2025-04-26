// src/routes/Routes.js
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import CreateLobbyPage from '../pages/CreateLobbyPage';
import GameDetailPage from '../pages/GameDetailPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage'; // ForgotPasswordPage'i içe aktardık
import VerifyEmailPage from '../pages/VerifyEmailPage'; // VerifyEmailPage'i içe aktardık
import { UserContext } from '../contexts/UserContext'; // DOĞRU İMPORT

function AppRoutes() {
  const { user } = useContext(UserContext);

  return (
    <Routes>
      <Route path="/" element={!user ? <LoginPage /> : <Navigate to="/home" />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/home" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/home" />} />
      <Route path="/forgot-password" element={!user ? <ForgotPasswordPage /> : <Navigate to="/home" />} />
      <Route path="/verify-email" element={!user ? <VerifyEmailPage /> : <Navigate to="/home" />} />
      <Route path="/home" element={user ? <HomePage /> : <Navigate to="/" />} />
      <Route path="/create-lobby" element={user ? <CreateLobbyPage /> : <Navigate to="/" />} />
      <Route path="/game/:id" element={user ? <GameDetailPage /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to={user ? "/home" : "/"} />} />
      {/* Diğer rotalar */}
    </Routes>
  );
}

export default AppRoutes;