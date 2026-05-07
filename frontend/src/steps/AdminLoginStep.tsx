import { useState } from 'react';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import { useNavigation } from '../hooks/useNavigation';
import { tokenStorage } from '../utils/api';

export default function AdminLoginStep() {
  const { navigateTo } = useNavigation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!password) {
      setError('관리자 비밀번호를 입력해주세요.');
      return;
    }

    // 백엔드 verifyAdmin 미들웨어가 헤더의 Bearer 토큰과 ADMIN_SECRET_KEY를 비교하므로
    // 입력한 비밀번호를 토큰 저장소에 저장하고 관리자 페이지로 이동합니다.
    tokenStorage.set(password);
    navigateTo('admin');
  };

  return (
    <S.StepContainer style={{ backgroundColor: '#fff', padding: 0, width: '100%', maxWidth: '480px', margin: '0 auto' }}>
      {/* 헤더 영역 (여백 24px) */}
      <div style={{ padding: '56px 24px 20px', borderBottom: '1px solid #e5e8eb' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#191f28' }}>관리자 접속</h1>
        <p style={{ fontSize: '15px', color: '#4e5968', margin: '8px 0 0 0' }}>관리자 비밀번호를 입력하여 시스템에 접속합니다.</p>
      </div>

      {/* 콘텐츠 영역 (여백 24px) */}
      <div style={{ padding: '32px 24px' }}>
        <C.InputGroup>
          <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#4e5968' }}>Admin Secret Key</div>
          <C.Input 
            type="password"
            placeholder="비밀번호를 입력하세요" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{ borderRadius: '12px' }}
          />
        </C.InputGroup>

        {error && (
          <p style={{ color: '#f04452', fontSize: '13px', marginTop: '12px' }}>{error}</p>
        )}

        <C.Button 
          onClick={handleLogin} 
          $variant="primary" 
          style={{ marginTop: '32px', width: '100%', backgroundColor: '#3182f6', borderRadius: '16px' }}
        >
          관리자 접속
        </C.Button>

        <p style={{ marginTop: '24px', textAlign: 'center', color: '#8b95a1', fontSize: '13px', lineHeight: '1.5' }}>
          입력하신 비밀번호는 관리자 전용 API 호출 시{'\n'}인증 헤더로 사용됩니다.
        </p>
      </div>
    </S.StepContainer>
  );
}
