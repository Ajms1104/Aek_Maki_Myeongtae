import React from 'react';
import ReactDOM from 'react-dom/client';
import * as TossSDK from '@apps-in-toss/web-bridge';
import App from './App';
import { NavigationProvider } from './contexts/NavigationContext';
import { TalismanProvider } from './contexts/TalismanContext';
import { UIProvider } from './contexts/UIContext';

// 토스 SDK 전역 주입
(window as any).TossPayments = TossSDK;
console.log('[Init] Toss SDK 주입 완료');

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
