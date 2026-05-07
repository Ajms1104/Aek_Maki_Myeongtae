import styled from 'styled-components';

export const MainButton = styled.button`
  width: 100%;
  height: 58px;
  border: none;
  border-radius: 18px;
  background: ${(props) =>
    props.disabled
      ? '#e5e8eb'
      : 'linear-gradient(90deg, #3182f6 0%, #3182f6 100%)'};
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:active {
    transform: ${(props) => (props.disabled ? 'none' : 'scale(0.97)')};
  }
`;

export const ToastContainer = styled.div<{ $show: boolean; $type?: 'success' | 'error' | 'info' }>`
  position: fixed;
  top: 50%;
  left: 50%;
  background: ${(props) => 
    props.$type === 'error' ? 'rgba(255, 68, 82, 0.98)' : 
    props.$type === 'info' ? 'rgba(33, 37, 41, 0.98)' : 
    'rgba(33, 37, 41, 0.98)'};
  backdrop-filter: blur(12px);
  color: #ffffff;
  padding: 20px 32px;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.25);
  z-index: 20000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  white-space: pre-wrap;
  text-align: center;
  min-width: 280px;
  max-width: 80%;
  pointer-events: none;
  
  opacity: ${(props) => (props.$show ? 1 : 0)};
  visibility: ${(props) => (props.$show ? 'visible' : 'hidden')};
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: ${(props) => (props.$show ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -40%) scale(0.9)')};

  svg {
    width: 32px;
    height: 32px;
    margin-bottom: 4px;
  }
`;

export const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px 34px;
  z-index: 20;
`;

export const FixedButtonGroup = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 24px 34px;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 1) 80%,
    rgba(255, 255, 255, 0) 100%
  );
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CollectionLink = styled.button`
  background: #f2f4f6;
  border: none;
  border-radius: 14px;
  padding: 10px 18px;
  color: #4e5968;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.2s;
  &:active {
    transform: scale(0.96);
  }
`;

export const InputGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const Input = styled.input`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background-color: #f9fafb;
  font-size: 16px;
  color: #191f28;
  transition: border-color 0.2s;
  &::placeholder {
    color: #adb5bd;
  }
  &:focus {
    outline: none;
    border-color: #3182f6;
  }
`;

export const Button = styled(MainButton)<{ $variant?: 'primary' | 'secondary' }>`
  background: ${(props) =>
    props.$variant === 'secondary'
      ? '#f2f4f6'
      : 'linear-gradient(90deg, #3182f6 0%, #3182f6 100%)'};
  color: ${(props) => (props.$variant === 'secondary' ? '#4e5968' : '#ffffff')};
`;
