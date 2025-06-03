import React, { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import Notification from './Notification';

function NotificationsContainer() {
  const { toasts, removeToast } = useContext(NotificationContext);

  return (
    <>
      {toasts.map(({ id, message, severity, autoHide }) => (
        <Notification
          key={id}
          open
          message={message}
          severity={severity}
          autoHide={autoHide}
          handleClose={() => removeToast(id)}
        />
      ))}
    </>
  );
}

export default NotificationsContainer; 