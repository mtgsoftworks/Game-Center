import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, severity = 'info', autoHide = 3000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, severity, autoHide }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </NotificationContext.Provider>
  );
} 