/**
 * src/context/AppContext.js: Uygulama genel state yönetimi sağlayan Context modülü.
 * Tema, dil, kullanıcı ve lobi bilgilerini yönetir.
 *
 * Dışa Aktarılanlar:
 *  - AppContext: State ve dispatch sağlayan React Context.
 *  - AppProvider({ children }): Context provider bileşeni.
 *
 * State Özellikleri:
 *  - auth: { user: null, token: null }
 *  - lobby: { lobbies: [] }
 *  - themeMode: 'gameCenter' veya 'gameSpecific'
 *  - locale: 'en' veya 'tr'
 *  - notifications: []
 */
import React, { createContext, useReducer } from 'react';

export const AppContext = createContext();

const savedThemeMode = localStorage.getItem('themeMode') || 'gameCenter';
const savedLocale = localStorage.getItem('locale') || 'tr';

const initialState = {
  auth: { user: null, token: null },
  lobby: { lobbies: [] },
  themeMode: savedThemeMode,
  locale: savedLocale,
  notifications: [
    { id: '1', type: 'gameInvite', message: 'Ahmet seni Valorant lobisine davet etti.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false, link: '/lobbies/valorant-123', actionText: 'Lobiye Git', actionLink: '/lobbies/valorant-123' },
    { id: '2', type: 'achievement', message: 'Yeni bir başarım kazandın: İlk Zafer!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: true, link: '/profile/achievements' },
    { id: '3', type: 'info', message: "Sistem bakımı bu gece 02:00'da başlayacaktır.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: false },
    { id: '4', type: 'warning', message: 'Şifrenizin süresi dolmak üzere. Lütfen güncelleyin.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: true, link: '/settings/security', actionText: 'Şifreyi Değiştir', actionLink: '/settings/security' },
    { id: '5', type: 'gameInvite', message: 'Ayşe seni LoL turnuvasına davet etti!', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), read: false, link: '/tournaments/lol-789' },
  ],
  // Örnek bildirim yapısı: { id: string, type: string (info, warning, gameInvite etc.), message: string, timestamp: date, read: boolean, link?: string, actionText?: string, actionLink?: string, actionDispatch?: { type: string, payload: any } }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, auth: { user: action.payload.user, token: action.payload.token } };
    case 'SET_LOBBIES':
      return { ...state, lobby: { ...state.lobby, lobbies: action.payload } };
    case 'SET_THEME_MODE':
      localStorage.setItem('themeMode', action.payload);
      return { ...state, themeMode: action.payload };
    case 'TOGGLE_THEME_MODE':
      const newThemeMode = state.themeMode === 'gameCenter' ? 'gameSpecific' : 'gameCenter';
      localStorage.setItem('themeMode', newThemeMode);
      return { ...state, themeMode: newThemeMode };
    case 'SET_LOCALE':
      localStorage.setItem('locale', action.payload);
      return { ...state, locale: action.payload };
    
    // Kalıcı Bildirimler için action'lar
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 19)], // En fazla 20 bildirim tut, yenisi başa
      };
    case 'MARK_NOTIFICATION_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => 
          notif.id === action.payload ? { ...notif, read: true } : notif
        ),
      };
    case 'MARK_ALL_NOTIFICATIONS_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => ({ ...notif, read: true })),
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
