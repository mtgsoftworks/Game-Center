import React, { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    notificationsEnabled: localStorage.getItem('notificationsEnabled') !== 'false',
    gameInviteNotificationsEnabled: localStorage.getItem('gameInviteNotificationsEnabled') !== 'false',
    lobbyActivityNotificationsEnabled: localStorage.getItem('lobbyActivityNotificationsEnabled') !== 'false',
    friendRequestNotificationsEnabled: localStorage.getItem('friendRequestNotificationsEnabled') !== 'false',
    generalAnnouncementNotificationsEnabled: localStorage.getItem('generalAnnouncementNotificationsEnabled') !== 'false',
    chatNotificationsEnabled: localStorage.getItem('chatNotificationsEnabled') !== 'false',
    achievementNotificationsEnabled: localStorage.getItem('achievementNotificationsEnabled') !== 'false',
  });

  const updateSetting = (key, value) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(key, String(value));
      return updated;
    });
  };

  useEffect(() => {
    const initialSettings = {
      soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
      notificationsEnabled: localStorage.getItem('notificationsEnabled') !== 'false',
      gameInviteNotificationsEnabled: localStorage.getItem('gameInviteNotificationsEnabled') !== 'false',
      lobbyActivityNotificationsEnabled: localStorage.getItem('lobbyActivityNotificationsEnabled') !== 'false',
      friendRequestNotificationsEnabled: localStorage.getItem('friendRequestNotificationsEnabled') !== 'false',
      generalAnnouncementNotificationsEnabled: localStorage.getItem('generalAnnouncementNotificationsEnabled') !== 'false',
      chatNotificationsEnabled: localStorage.getItem('chatNotificationsEnabled') !== 'false',
      achievementNotificationsEnabled: localStorage.getItem('achievementNotificationsEnabled') !== 'false',
    };
    setSettings(initialSettings);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
} 