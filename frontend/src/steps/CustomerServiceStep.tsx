import React from 'react';
import { IoChevronForwardOutline } from 'react-icons/io5';
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import * as O from '../styles/overlayStyles';
import * as C from '../styles/commonStyles';
import { useNavigation } from '../hooks/useNavigation';
import { useUI } from '../hooks/useUI';

const CustomerServiceStep: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { openDialog } = useUI();
  const faqs = [
    {
      q: '부적 이미지는 어디에 저장되나요?',
      a: '기기의 갤러리 또는 사진 앱에 저장됩니다.',
    },
    {
      q: '결제한 히든 부적이 보이지 않아요',
      a: '보관함 상단의 [히든 얻기]를 다시 확인해 주세요.',
    },
    {
      q: 'AI 답변이 마음에 들지 않아요',
      a: '새로운 고민을 적어 다시 부적을 받을 수 있습니다.',
    },
    {
      q: '환불 규정이 궁금해요',
      a: '디지털 상품 특성상 사용 전후에는 환불이 어렵습니다.',
    },
  ];

  return (
    <L.Content style={{ alignItems: 'flex-start' }}>
      <L.Title
        style={{ textAlign: 'left', width: '100%', marginBottom: '12px' }}
      >
        무엇을 도와드릴까요?
      </L.Title>
      <p style={{ color: '#6b7684', fontSize: '15px', marginBottom: '32px' }}>
        액막이AI 이용 중 궁금한 점을 확인하세요.
      </p>

      <div
        style={{
          width: '100%',
          marginBottom: '16px',
          fontWeight: 700,
          color: '#191f28',
          fontSize: '17px',
        }}
      >
        자주 묻는 질문
      </div>
      <S.ScrollArea>
        <O.MenuList>
          {faqs.map((faq, index) => (
            <O.MenuItem
              key={index}
              style={{
                padding: '18px 0',
                borderBottom: '1px solid #f2f4f6',
                borderRadius: 0,
              }}
              onClick={() => openDialog(faq.q, faq.a)}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#333d4b',
                    marginBottom: '4px',
                  }}
                >
                  {faq.q}
                </div>
                <div style={{ fontSize: '14px', color: '#8b95a1' }}>
                  {faq.a}
                </div>
              </div>
              <IoChevronForwardOutline color="#b0b8c1" size={20} />
            </O.MenuItem>
          ))}
        </O.MenuList>
      </S.ScrollArea>

      <C.FixedButtonGroup style={{ flexDirection: 'column', gap: '12px' }}>
        <C.MainButton
          onClick={() => navigateTo('inquiry')}
          style={{
            height: '70px',
            fontSize: '20px',
            fontWeight: 800,
          }}
        >
          1:1 문의하기
        </C.MainButton>
      </C.FixedButtonGroup>
    </L.Content>
  );
};

export default CustomerServiceStep;
