import React, { useState } from 'react';
import { signInWithPopup, signInAnonymously, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../UI/LanguageSwitcher';
import { LogIn, Users } from 'lucide-react';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [anonNickname, setAnonNickname] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/lobby');
    } catch (error: unknown) {
      // Narrow error to Error for message
      if (error instanceof Error) {
        console.error("Google Sign-In Error:", error);
        setError(`${t('auth.googleSignInError')}: ${error.message}`);
      } else {
        console.error("Google Sign-In Error:", error);
        setError(`${t('auth.googleSignInError')}: ${String(error)}`);
      }
    }
  };

  const handleAnonymousSignIn = async () => {
    setError('');
    if (!anonNickname.trim()) {
      setError('Please enter a nickname');
      return;
    }
    try {
      const userCred = await signInAnonymously(auth);
      if (userCred.user) {
        await updateProfile(userCred.user, { displayName: anonNickname.trim() });
      }
      navigate('/lobby');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Anonymous Sign-In Error:", error);
        setError(`${t('auth.anonymousSignInError')}: ${error.message}`);
      } else {
        console.error("Anonymous Sign-In Error:", error);
        setError(`${t('auth.anonymousSignInError')}: ${String(error)}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <LogIn className="w-8 h-8 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">{t('auth.login')}</h2>
          </div>
          <LanguageSwitcher />
        </div>
        
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
          <h3 className="font-semibold text-lg text-indigo-700 mb-2">
            {t('auth.welcomeToBingo')}
          </h3>
          <p className="text-indigo-700 mb-2">
            {t('auth.gameDescription')}
          </p>
          <div className="flex items-center text-indigo-700 mt-3">
            <Users className="w-5 h-5 mr-2" />
            <span>{t('auth.twoPlayerGame')}</span>
          </div>
        </div>
        
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <img
              className="h-5 w-5 mr-2"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
            />
            {t('auth.googleSignIn')}
          </button>

          <div>
            <input
              type="text"
              value={anonNickname}
              onChange={e => setAnonNickname(e.target.value)}
              placeholder="Nickname"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <button
            onClick={handleAnonymousSignIn}
            className="w-full flex items-center justify-center bg-gray-600 rounded-lg px-4 py-3 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {t('auth.playAnonymously')}
          </button>
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth.loginDisclaimer')}
        </p>
      </div>
    </div>
  );
};

export default Login;