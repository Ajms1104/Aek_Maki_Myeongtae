import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * { 
    box-sizing: border-box; 
    -webkit-tap-highlight-color: transparent; 
  }
  
  body { 
    margin: 0; 
    padding: 0; 
    background-color: #f2f4f6; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    height: 100vh;
    height: 100dvh;
    overflow: hidden; /* 전체 스크롤 차단 */
    position: fixed; /* iOS 등에서 바운스 방지 */
    width: 100%;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
    -webkit-font-smoothing: antialiased; 
    letter-spacing: -0.4px;
    touch-action: manipulation; /* 기본 제스처 허용하되 스크롤은 컨테이너에서 제어 */
    overscroll-behavior: none;
  }

  #root {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  button {
    font-family: inherit;
    border: none;
    cursor: pointer;
  }

  textarea {
    font-family: inherit;
  }
`;
