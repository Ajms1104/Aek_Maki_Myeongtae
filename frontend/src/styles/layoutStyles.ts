import styled, { css } from 'styled-components';
import * as A from './animations';

export const Container = styled.div`
  width: 375px;
  height: 812px;
  background-color: #ffffff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  border-radius: 40px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

export const Header = styled.header`
  padding: 56px 20px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
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
      animation: ${A.contentShake} 0.1s infinite;
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
