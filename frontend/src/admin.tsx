import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { NavigationProvider } from './contexts/NavigationContext';
import { TalismanProvider } from './contexts/TalismanContext';
import { UIProvider } from './contexts/UIContext';

// 🔒 [어드민 독립 배포 엔트리] 토스 네이티브 브릿지 주입 없이 일반 PC 웹 브라우저 표준으로 기동
console.log('[Admin Init] 어드민 대시보드 콘솔 앱 구동');

// 🖥️ [PC 어드민 body 스타일 초기화]
// globalStyles.ts에 모바일 앱 전용으로 설정된 overflow:hidden, position:fixed를 PC 환경에 맞게 풀어줍니다.
document.body.style.overflow = 'auto';
document.body.style.position = 'static';
document.body.style.height = 'auto';
document.body.style.display = 'block';
document.documentElement.style.overflow = 'auto';

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
