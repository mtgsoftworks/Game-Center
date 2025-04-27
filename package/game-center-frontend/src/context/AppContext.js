import React, { createContext, useReducer } from 'react';

export const AppContext = createContext();

const savedThemeMode = localStorage.getItem('themeMode') || 'ui';
const savedLocale = localStorage.getItem('locale') || 'en';

const initialState = {
  auth: { user: null, token: null },
  lobby: { lobbies: [] },
  themeMode: savedThemeMode,
  locale: savedLocale
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
    case 'SET_LOCALE':
      localStorage.setItem('locale', action.payload);
      return { ...state, locale: action.payload };
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
