/**
 * src/components/Auth/PrivateRoute.tsx: Yalnızca oturum açmış kullanıcıların erişebileceği korumalı rotaları yöneten bileşen.
 * Kullanıcı giriş yapmamışsa otomatik olarak giriş ekranına yönlendirir.
 * React Router ile birlikte çalışır. Çoklu dil desteği içerir.
 *
 * @returns {JSX.Element} Korumalı rota veya yönlendirme.
 */
import React from 'react'; // React ve JSX desteği için React paketini içe aktar
import { Navigate } from 'react-router-dom'; // Navigate: kullanıcı yönlendirmesi için React Router bileşeni
import { useAuth } from '../../contexts/AuthContext'; // useAuth: kimlik doğrulama durumunu yönetmek için özel React hook'u

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;