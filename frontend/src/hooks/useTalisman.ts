import { useContext } from 'react';
import { TalismanContext } from '../contexts/TalismanContext';

export const useTalisman = () => {
  const context = useContext(TalismanContext);
  if (!context) {
    throw new Error('useTalisman must be used within a TalismanProvider');
  }
  return context;
};
