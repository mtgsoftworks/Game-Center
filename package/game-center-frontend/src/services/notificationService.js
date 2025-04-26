// src/services/notificationService.js
// Bildirim izni isteme ve bildirim gösterme fonksiyonları

export const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission()
        .then(permission => {
          if (permission === 'granted') {
            console.log('Bildirim izni verildi.');
          }
        })
        .catch(error => {
          console.error('Bildirim izni alınamadı:', error);
        });
    }
  };
  
  export const showNotification = (title, options) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };