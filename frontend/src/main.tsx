import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { NavigationProvider } from './contexts/NavigationContext';
import { TalismanProvider } from './contexts/TalismanContext';
import { UIProvider } from './contexts/UIContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UIProvider>
      <TalismanProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </TalismanProvider>
    </UIProvider>
  </React.StrictMode>,
);
