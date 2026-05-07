import styled, { css } from 'styled-components';
import * as A from './animations';

export const Container = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  height: 100vh;
  height: 100dvh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden; /* 원천적으로 스크롤 방지 */
  padding-top: 0; /* 토스 네이티브 바 공간을 고려해 0으로 설정 */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
`;

export const Header = styled.header`
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  position: sticky;
  top: 0;
  background: #ffffff;
  height: 56px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
`;

export const NavTitle = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 17px;
  font-weight: 700;
  color: #191f28;
  pointer-events: none; /* 클릭 방해 금지 */
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.2s;
  &:active {
    background: #f2f4f6;
    transform: scale(0.92);
  }
`;

export const Content = styled.main<{ $shake?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 24px;
  position: relative;
  overflow: hidden; /* 한 화면 고정 */

  ${(props) =>
    props.$shake &&
    css`
      animation: ${A.shake} 0.1s infinite;
    `}
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #191f28;
  margin: 16px 0 8px 0;
  text-align: center;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: keep-all;
`;
