import React, { useState } from 'react';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import { useNavigation } from '../hooks/useNavigation';
import { tokenStorage } from '../utils/api';

export default function AdminLoginStep() {
  const { navigateTo } = useNavigation();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!id || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      // TODO: 백엔드 팀원이 개발 중인 관리자 로그인 API 엔드포인트로 교체 필요
      // 현재는 예시로 /api/v1/auth/admin/login 사용
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: id, password }),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        tokenStorage.set(data.accessToken);
        navigateTo('admin'); // 로그인 성공 시 관리자 메인으로
      } else {
        setError(data.error || '로그인에 실패했습니다. 정보를 확인해주세요.');
      }
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <S.StepContainer style={{ backgroundColor: '#fff', padding: 0, width: '100%', maxWidth: '480px', margin: '0 auto' }}>
      {/* 헤더 영역 (여백 24px) */}
      <div style={{ padding: '56px 24px 20px', borderBottom: '1px solid #e5e8eb' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#191f28' }}>관리자 로그인</h1>
        <p style={{ fontSize: '15px', color: '#4e5968', margin: '8px 0 0 0' }}>운영자 계정으로 로그인하여 시스템을 관리합니다.</p>
      </div>

      {/* 콘텐츠 영역 (여백 24px) */}
      <div style={{ padding: '32px 24px' }}>
        <C.InputGroup>
          <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#4e5968' }}>ID</div>
          <C.Input 
            placeholder="관리자 아이디" 
            value={id} 
            onChange={(e) => setId(e.target.value)}
            style={{ borderRadius: '12px' }}
          />
        </C.InputGroup>

        <C.InputGroup style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#4e5968' }}>Password</div>
          <C.Input 
            type="password"
            placeholder="비밀번호" 
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
          로그인
        </C.Button>

        {/* 테스트용 건너뛰기 (개발 중에만 사용) */}
        <div 
          onClick={() => {
            tokenStorage.set('admin_test_key');
            navigateTo('admin');
          }}
          style={{ marginTop: '20px', textAlign: 'center', color: '#adb5bd', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
        >
          (테스트용) 로그인 건너뛰기
        </div>
      </div>
    </S.StepContainer>
  );
}
