import React from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { useNavigation } from '../hooks/useNavigation';
import * as L from '../styles/layoutStyles';

const CustomNavigationBar: React.FC = () => {
  const { step, handleBack } = useNavigation();

  const isMain = step === 'main';
  if (isMain) return null;

  return (
    <L.Header style={{ 
      backgroundColor: '#ffffff', 
      borderBottom: 'none', 
      height: '56px', // 표준 높이로 고정
      position: 'relative', // ✅ 흐름에 포함시켜 공간을 차지하게 함
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px'
    }}>
      <L.IconButton 
        onClick={() => handleBack(() => {})} 
        style={{ 
          background: 'none',
          borderRadius: '12px',
          padding: '8px'
        }}
      >
        <IoChevronBack size={26} color="#191f28" />
      </L.IconButton>
    </L.Header>
  );
};

export default CustomNavigationBar;
