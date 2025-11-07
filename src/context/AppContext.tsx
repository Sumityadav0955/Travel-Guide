// Application context - placeholder for task implementation
import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AppState } from '../types';

// Initial state
const initialState: AppState = {
  user: {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
  },
  locations: {
    items: [],
    selectedLocation: null,
    searchFilters: {},
    loading: false,
  },
  reviews: {
    items: [],
    loading: false,
  },
  ui: {
    mapView: false,
    sidebarOpen: false,
    notifications: [],
  },
};

// Action types - will be expanded in later tasks
type AppAction = 
  | { type: 'SET_LOADING'; payload: { section: keyof AppState; loading: boolean } }
  | { type: 'SET_USER'; payload: AppState['user'] }
  | { type: 'SET_LOCATIONS'; payload: AppState['locations'] }
  | { type: 'SET_REVIEWS'; payload: AppState['reviews'] }
  | { type: 'SET_UI'; payload: Partial<AppState['ui']> };

// Reducer function - will be expanded in later tasks
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        [action.payload.section]: {
          ...state[action.payload.section],
          loading: action.payload.loading,
        },
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOCATIONS':
      return { ...state, locations: action.payload };
    case 'SET_REVIEWS':
      return { ...state, reviews: action.payload };
    case 'SET_UI':
      return { ...state, ui: { ...state.ui, ...action.payload } };
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;