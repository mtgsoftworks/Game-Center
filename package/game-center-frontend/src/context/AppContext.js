import React, { createContext, useReducer } from 'react';

export const AppContext = createContext();

const initialState = {
  auth: { user: null, token: null },
  lobby: { lobbies: [] },
  themeMode: 'ui', // 'ui' or 'game'
  locale: 'en'
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, auth: { user: action.payload.user, token: action.payload.token } };
    case 'SET_LOBBIES':
      return { ...state, lobby: { ...state.lobby, lobbies: action.payload } };
    case 'SET_THEME_MODE':
      return { ...state, themeMode: action.payload };
    case 'SET_LOCALE':
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
