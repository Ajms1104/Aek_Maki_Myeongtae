import React, { useState } from 'react';
import * as L from '../styles/layoutStyles';
import * as C from '../styles/commonStyles';
import { useNavigation } from '../hooks/useNavigation';
import { useUI } from '../hooks/useUI';
import { tokenStorage } from '../utils/api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const InquiryStep: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { openDialog } = useUI();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const handleSubmit = async () => {
    if (content.trim().length < 10) return;

     setIsSubmitting(true);
    try {
      // ✅ 백엔드 API 호출
      const token = tokenStorage.get();
      const res = await fetch(`${BASE_URL}/api/v1/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: '1:1 문의',
          content: content.trim(),
        }),
      });

    if(res.ok) {
      openDialog(
      '문의가 접수되었어요',
      '보내주신 내용은 순차적으로 확인 후\n답변드릴게요.',
    );
    navigateTo('customer_service');
    } else {
      openDialog('전송 실패', '잠시 후 다시 시도해주세요');
    }
  } catch(err){
    openDialog('오류 발생', '네트워크 연결을 확인해주세요.');
  } finally{
    setIsSubmitting(false);
  }
  };

  const disabled = content.trim().length < 10;

  return (
    <L.Content>
      <L.Title>앱 이용 중 어떤{'\n'}문제가 있으셨나요?</L.Title>
      <p
        style={{
          color: '#6b7684',
          fontSize: '14px',
          lineHeight: 1.6,
          margin: '8px 0 20px',
          textAlign: 'center',
        }}
      >
        최대한 자세히 적어주시면 더 빠르고 정확하게 도와드릴 수 있어요.
      </p>

      <div
        style={{
          width: '100%',
          padding: '18px 18px 32px',
          background: '#f9fafb',
          borderRadius: '20px',
          border: '1px solid #e5e8eb',
        }}
      >
        <textarea
          placeholder="발생한 상황, 화면, 결제 정보 등을 가능한 한 자세히 적어주세요."
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 500))}
          style={{
            width: '100%',
            minHeight: '160px',
            border: 'none',
            background: 'transparent',
            resize: 'none',
            outline: 'none',
            fontSize: '15px',
            lineHeight: 1.6,
            color: '#191f28',
            fontFamily: 'inherit',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <span style={{ color: '#f04452' }}>
            {content.trim().length > 0 && content.trim().length < 10
              ? '10자 이상 적어주세요'
              : ''}
          </span>
          <span style={{ color: '#adb5bd' }}>{content.length}/500</span>
        </div>
      </div>

      <C.FixedButtonGroup>
        <C.MainButton disabled={disabled} onClick={handleSubmit}>
          문의 보내기
        </C.MainButton>
      </C.FixedButtonGroup>
    </L.Content>
  );
};

export default InquiryStep;

