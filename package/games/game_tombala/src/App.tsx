import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SoundProvider } from './contexts/SoundContext';
import { ThemeModeProvider } from './contexts/ThemeModeContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import MainLobby from './components/Lobby/MainLobby';
import GameScreen from './components/Game/GameScreen';
// Remove import for non-existent ResetPassword component
// import ResetPassword from './components/Auth/ResetPassword';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <SoundProvider>
            <ThemeModeProvider>
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    borderRadius: '8px',
                    background: '#333',
                    color: '#fff',
                  },
                  duration: 3000
                }}
              />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                {/* Remove route for non-existent ResetPassword component */}
                {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
                <Route 
                  path="/lobby" 
                  element={
                    <PrivateRoute>
                      <MainLobby />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/game/:roomId" 
                  element={
                    <PrivateRoute>
                      <GameScreen />
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={<Login />} />
              </Routes>
            </ThemeModeProvider>
          </SoundProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;