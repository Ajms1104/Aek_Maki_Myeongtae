import React from 'react';
import styled, { keyframes } from 'styled-components';
import { IoChatbubbles } from 'react-icons/io5';
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import { useTalisman } from '../hooks/useTalisman';
import { useNavigation } from '../hooks/useNavigation';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const AnimatedSection = styled.div`
  animation: ${fadeInUp} 0.5s ease-out forwards;
`;

const ErrorBadge = styled.span`
  color: #f04452;
  font-size: 12px;
  fontWeight: 600;
  background-color: #fff0f0;
  padding: 4px 10px;
  border-radius: 8px;
  animation: ${fadeInUp} 0.2s ease-out;
`;

const InputStep: React.FC = () => {
  const { wish, setWish } = useTalisman();
  const { navigateTo } = useNavigation();

  return (
    <L.Content style={{ padding: 0, backgroundColor: '#ffffff' }}>
      {/* 헤더와 완벽히 이어지는 화이트 톤 디자인 */}
      <div style={{ 
        width: '100%', 
        backgroundColor: '#ffffff', 
        padding: '24px 24px 16px',
        textAlign: 'left',
      }}>
        <AnimatedSection>
          <L.Title style={{ 
            textAlign: 'left', 
            fontSize: '26px', 
            margin: '0 0 16px', 
            lineHeight: '1.4',
            color: '#191f28',
            fontWeight: 800,
            letterSpacing: '-0.6px'
          }}>
            마음속 깊은 고민을{'\n'}
            자유롭게 적어주세요
          </L.Title>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            color: '#6b7684'
          }}>
            <IoChatbubbles size={16} />
            <span style={{ 
              fontSize: '15px', 
              fontWeight: 500,
              lineHeight: '1.5'
            }}>
              AI 명태가 당신의 소원을 분석해요
            </span>
          </div>
        </AnimatedSection>
      </div>

      <div style={{ padding: '0 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <S.InputContainer style={{ marginTop: '0px', height: 'auto', flex: 1 }}>
          <S.InputField
            placeholder={`이곳에 소중한 마음을\n담아보세요`}
            style={{ marginTop: '90px', height: '180px' }}
            value={wish}
            onChange={(e) => setWish(e.target.value.slice(0, 200))}
          />
          
          {/* 글자 수 표시 및 검증 문구 디자인 개선 */}
          <div
            style={{
              position: 'absolute',
              bottom: '110px',
              width: '55%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              zIndex: 10,
            }}
          >
            {wish.length > 0 && wish.length < 5 && (
              <ErrorBadge>
                최소 5자 이상 적어주세요
              </ErrorBadge>
            )}
            <span style={{ 
              fontSize: '13px',
              fontWeight: 700,
              color: wish.length >= 200 ? '#f04452' : '#adb5bd',
              letterSpacing: '0.5px'
            }}>
              {wish.length} / 200
            </span>
          </div>
        </S.InputContainer>
        
        <C.ButtonGroup style={{ paddingBottom: '32px' }}>
          <C.MainButton
            disabled={wish.length < 5}
            onClick={() => navigateTo('loading')}
            style={{ 
              height: '56px',
              fontSize: '17px',
              fontWeight: 700,
              boxShadow: wish.length >= 5 ? '0 12px 24px rgba(49, 130, 246, 0.15)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            다 적었어요
          </C.MainButton>
        </C.ButtonGroup>
      </div>
    </L.Content>
  );
};

export default InputStep;
