/**
 * context/AppContext.jsx
 *
 * Global UI/app-level state that doesn't belong to auth:
 *  - Sidebar open/close
 *  - Global loading overlay
 *  - Theme preference (light | dark) persisted to localStorage
 */

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('prepai-theme') : null;

const initialState = {
  isSidebarOpen:    false,
  isGlobalLoading:  false,
  theme:            storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'light',
};

const APP_ACTIONS = {
  TOGGLE_SIDEBAR:       'TOGGLE_SIDEBAR',
  SET_SIDEBAR:          'SET_SIDEBAR',
  SET_GLOBAL_LOADING:   'SET_GLOBAL_LOADING',
  SET_THEME:            'SET_THEME',
};

const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, isSidebarOpen: !state.isSidebarOpen };

    case APP_ACTIONS.SET_SIDEBAR:
      return { ...state, isSidebarOpen: action.payload };

    case APP_ACTIONS.SET_GLOBAL_LOADING:
      return { ...state, isGlobalLoading: action.payload };

    case APP_ACTIONS.SET_THEME:
      return { ...state, theme: action.payload };

    default:
      return state;
  }
};

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toggleSidebar     = useCallback(() => dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR }), []);
  const setSidebar        = useCallback((v) => dispatch({ type: APP_ACTIONS.SET_SIDEBAR, payload: v }), []);
  const setGlobalLoading  = useCallback((v) => dispatch({ type: APP_ACTIONS.SET_GLOBAL_LOADING, payload: v }), []);
  const setTheme          = useCallback((t) => dispatch({ type: APP_ACTIONS.SET_THEME, payload: t }), []);

  useEffect(() => {
    localStorage.setItem('prepai-theme', state.theme);
    document.documentElement.classList.toggle('light', state.theme === 'light');
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  const value = {
    ...state,
    toggleSidebar,
    setSidebar,
    setGlobalLoading,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
};
