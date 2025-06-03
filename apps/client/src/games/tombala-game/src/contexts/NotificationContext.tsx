/**
 * src/contexts/NotificationContext.tsx: Uygulama bildirim durumunu yöneten Context modülü.
 * Snackbar ve Alert bileşenleri ile kullanıcı bildirim gönderimini kontrol eder.
 * showNotification fonksiyonu ile bildirim tetiklenir ve otomatik kapanma işlemleri yönetilir.
 *
 * Dışa Aktarılanlar:
 *  - useNotification(): Bildirim göstermek için hook.
 *  - NotificationProvider({ children }): Bildirim verilerini ve fonksiyonlarını sağlayan provider bileşeni.
 *
 * @returns {JSX.Element} Notification context provider bileşeni.
 */
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
// React: Context oluşturma, state yönetimi ve hook kullanımı için gerekli
import Snackbar from '@mui/material/Snackbar';
// Snackbar: kısa süreli bildirim göstermek için MUI bileşeni
import Alert, { AlertColor } from '@mui/material/Alert';
// Alert: bildirim mesajının şiddetine göre renk ve ikon sağlar

interface NotificationState {
  // open: Snackbar açık mı, message: gösterilecek metin, severity: bilgi seviyesi
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
// NotificationContext: uygulama geneli bildirim fonksiyonunu paylaşır

export function useNotification() {
  // useNotification: NotificationContext'i tüketen hook
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // notification: Snackbar ve Alert özelliklerini tutar
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info', // Default severity
  });

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    // handleClose: Snackbar kapatma işlemini yönetir
    if (reason === 'clickaway') {
      return;
    }
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const showNotification = useCallback((message: string, severity: AlertColor = 'info') => {
    // showNotification: bileşenlerde çağrıldığında Snackbar'ı açar
    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  const contextValue: NotificationContextType = {
    showNotification,
  };

  return (
    // NotificationContext.Provider: alt bileşenlere showNotification fonksiyonunu sunar
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000} // Adjust duration as needed
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Position
      >
        {/* Alert: bildirim mesajını severity'e göre renklendirir */}
        <Alert onClose={handleClose} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}