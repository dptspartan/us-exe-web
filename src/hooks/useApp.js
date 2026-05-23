import { useContext } from 'react';
import { AppContext } from '../context/AuthContext';

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be invoked strictly within an AppProvider boundary.');
  }
  return context;
}
