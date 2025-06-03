import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

/**
 * useToast
 * @returns showToast fonksiyonu
 */
const useToast = () => {
  const { showToast } = useContext(NotificationContext);
  return showToast;
};

export default useToast; 