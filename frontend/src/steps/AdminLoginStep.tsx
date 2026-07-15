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
    // 입력한 비밀번호를 어드민 전용 로컬 저장소(adminToken)에 영구 저장하고 관리자 페이지로 이동합니다.
    localStorage.setItem('adminToken', password);
    navigateTo('admin');
  };

  return (
    <div style={{ 
      backgroundColor: '#f2f4f6', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '"Pretendard", sans-serif'
    }}>
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '40px 32px', 
        width: '100%', 
        maxWidth: '420px', 
        borderRadius: '24px',
        boxShadow: '0 15px 45px rgba(0,0,0,0.08)',
        border: '1px solid #e5e8eb'
      }}>
        {/* 헤더 영역 */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 900, margin: 0, color: '#191f28' }}>운영 관리자 접속</h1>
          <p style={{ fontSize: '14px', color: '#4e5968', margin: '8px 0 0 0', fontWeight: 500 }}>관리자 Secret Key를 입력하여 로그인하세요.</p>
        </div>

        {/* 콘텐츠 영역 */}
        <div>
          <C.InputGroup>
            <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 700, color: '#4e5968' }}>Admin Secret Key</div>
            <C.Input 
              type="password"
              placeholder="비밀번호를 입력하세요" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{ borderRadius: '12px', height: '48px', fontSize: '15px' }}
            />
          </C.InputGroup>

          {error && (
            <p style={{ color: '#f04452', fontSize: '13px', marginTop: '12px', fontWeight: 650 }}>{error}</p>
          )}

          <C.Button 
            onClick={handleLogin} 
            $variant="primary" 
            style={{ marginTop: '28px', width: '100%', backgroundColor: '#3182f6', borderRadius: '14px', height: '48px', fontSize: '16px', fontWeight: 800 }}
          >
            접속하기
          </C.Button>

          <p style={{ marginTop: '28px', textAlign: 'center', color: '#8b95a1', fontSize: '12px', lineHeight: '1.6', fontWeight: 500 }}>
            입력하신 비밀번호는 관리자 API 인증용{'\n'}Bear Token 헤더로 바인딩됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
