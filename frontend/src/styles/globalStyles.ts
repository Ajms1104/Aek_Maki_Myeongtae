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
    min-height: 100vh;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
    -webkit-font-smoothing: antialiased; 
    letter-spacing: -0.4px;
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
