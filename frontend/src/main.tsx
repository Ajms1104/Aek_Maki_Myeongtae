//경로 설정 등 메인이 되는 파일
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'; //토스 TDS 라이브러리
import Main_home from './pages/Home.tsx' //홈화면 경로

//경로 설정 | TDS 사이에 감싸주면 됨
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileAITProvider>
      <Main_home />
    </TDSMobileAITProvider>
  </StrictMode>,
)
