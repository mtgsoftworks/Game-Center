// src/hooks/useAuth.js
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function useAuth() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Kullanıcı oturum açmamışsa, login sayfasına yönlendir
      navigate('/login');
    }
  }, [user, navigate]);

  return user;
}

export default useAuth;