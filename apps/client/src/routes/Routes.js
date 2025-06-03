// src/routes/Routes.js
import React, { useContext, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/animations/PageTransition';
import { Box, CircularProgress } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import Layout from '../components/Layout'; 

// Lazy loaded page components
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const HomePage = lazy(() => import('../pages/HomePage'));
const GameDetailPage = lazy(() => import('../pages/GameDetailPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const ChatPage = lazy(() => import('../pages/ChatPage'));
const GamesPage = lazy(() => import('../pages/GamesPage'));
const StatsPage = lazy(() => import('../pages/StatsPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const GamePlaygroundPage = lazy(() => import('../pages/SinglePlayerGamePage'));

// Helper component for protected routes using AuthContext
const ProtectedRoute = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  if (!user) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return (
    <Layout>
      <PageTransition>
        <Outlet />
      </PageTransition>
    </Layout>
  );
};

// Helper component for public routes (e.g., login, register) using AuthContext
const PublicRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  if (user) {
    // If user is already logged in, redirect to home or the intended destination
    const from = location.state?.from?.pathname || '/home';
    return <Navigate to={from} replace />;
  }
  
  return <PageTransition>{children}</PageTransition>;
};

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      }>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } />
          
          <Route path="/verify-email" element={
            <PublicRoute>
              <VerifyEmailPage />
            </PublicRoute>
          } />
          
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route index element={<HomePage />} />
            <Route path="home" element={<HomePage />} />
            <Route path="game/:id" element={<GameDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="games/:gameId" element={<GameDetailPage />} />
            <Route path="playground/:gameName" element={<GamePlaygroundPage />} />
          </Route>
          
          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default AppRoutes;