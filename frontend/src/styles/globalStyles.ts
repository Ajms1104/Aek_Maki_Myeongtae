import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  
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
    touch-action: none; /* 제스처에 의한 스크롤 방지 */
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
