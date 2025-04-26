// src/hooks/useAuth.js
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

function useAuth() {
  const { user } = useContext(UserContext);
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