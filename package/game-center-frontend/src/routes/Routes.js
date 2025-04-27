// src/routes/Routes.js
import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import CreateLobbyPage from '../pages/CreateLobbyPage';
import EditLobbyPage from '../pages/EditLobbyPage';
import GameDetailPage from '../pages/GameDetailPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage'; // ForgotPasswordPage'i içe aktardık
import VerifyEmailPage from '../pages/VerifyEmailPage'; // VerifyEmailPage'i içe aktardık
import SettingsPage from '../pages/SettingsPage';
import LobbyChatPage from '../pages/LobbyChatPage';
import { UserContext } from '../contexts/UserContext'; // DOĞRU İMPORT

function AppRoutes() {
  const { user } = useContext(UserContext);
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition>{!user ? <LoginPage /> : <Navigate to="/home" />}</PageTransition>} />
        <Route path="/login" element={<PageTransition>{!user ? <LoginPage /> : <Navigate to="/home" />}</PageTransition>} />
        <Route path="/register" element={<PageTransition>{!user ? <RegisterPage /> : <Navigate to="/home" />}</PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition>{!user ? <ForgotPasswordPage /> : <Navigate to="/home" />}</PageTransition>} />
        <Route path="/verify-email" element={<PageTransition>{!user ? <VerifyEmailPage /> : <Navigate to="/home" />}</PageTransition>} />
        <Route path="/home" element={<PageTransition>{user ? <HomePage /> : <Navigate to="/" />}</PageTransition>} />
        <Route path="/create-lobby" element={<PageTransition>{user ? <CreateLobbyPage /> : <Navigate to="/" />}</PageTransition>} />
        <Route path="/game/:id" element={<PageTransition>{user ? <GameDetailPage /> : <Navigate to="/" />}</PageTransition>} />
        <Route path="/settings" element={<PageTransition>{user ? <SettingsPage /> : <Navigate to="/" />}</PageTransition>} />
        <Route path="/lobbies/:id/chat" element={<PageTransition>{user ? <LobbyChatPage /> : <Navigate to="/" />}</PageTransition>} />
        <Route path="/lobbies/:id/edit" element={<PageTransition>{user ? <EditLobbyPage /> : <Navigate to="/" />}</PageTransition>} />
        <Route path="*" element={<PageTransition><Navigate to={user ? "/home" : "/"} /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default AppRoutes;