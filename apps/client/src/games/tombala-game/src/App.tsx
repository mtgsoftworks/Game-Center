/**
 * src/App.tsx: Tombala uygulamasının kök bileşeni. Router ve context sağlayıcılarını içerir.
 * Uygulamanın kökünde router ve context provider'ları sarmalar.
 * Kimlik doğrulama, bildirim, ses ve tema yönetimi için context sağlar.
 * Rota koruması için PrivateRoute kullanılır. Çoklu dil desteği içerir.
 *
 * @returns {JSX.Element} Uygulamanın kök bileşeni.
 */
// Router: sayfa ve URL tabanlı gezinmeyi sağlar
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Context sağlayıcıları: kimlik, bildirim, ses ve tema modlarını sağlar
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

// App bileşeni: Router ve tüm Context sağlayıcılarını saran kök uygulama bileşeni
function App() {
  return (
    <Router>
      {/* AuthProvider: kimlik doğrulama durumunu yönetir */}
      <AuthProvider>
        {/* NotificationProvider: uygulama içi bildirimleri yönetir */}
        <NotificationProvider>
          {/* SoundProvider: ses efektleri ve mute durumunu sağlar */}
          <SoundProvider>
            {/* ThemeModeProvider: koyu/açık tema modunu kontrol eder */}
            <ThemeModeProvider>
              {/* Toaster: global toast bildirimi bileşeni */}
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
              {/* Uygulama rotaları: giriş, kayıt, lobi ve oyun ekranları */}
              <Routes>
                {/* Giriş ekranı */}
                <Route path="/giris" element={<Login />} />
                {/* Kayıt ekranı */}
                <Route path="/kayit" element={<Signup />} />
                {/* Ana lobi, sadece giriş yapan kullanıcılar erişebilir */}
                <Route 
                  path="/lobby" 
                  element={
                    <PrivateRoute>
                      <MainLobby />
                    </PrivateRoute>
                  } 
                />
                {/* Oyun ekranı, sadece giriş yapan kullanıcılar erişebilir */}
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

// Varsayılan olarak App bileşenini dışa aktarır
export default App;