import React, { useState, useEffect, useMemo } from 'react';
import { IoFileTrayFullOutline, IoSparkles } from 'react-icons/io5';
import styled from 'styled-components';
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import * as A from '../styles/animations';
import type { Talisman } from '../types/index';
import { GRADE_COLORS } from '../constants/talisman';
import { TalismanDetailModal } from '../components/Overlays';
import { useNavigation } from '../hooks/useNavigation';
import { useTalisman } from '../hooks/useTalisman';

// 해금 시 봉인 장막 스타일
const SealedOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(25, 31, 40, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 22px;
  
  .sparkle-icon {
    animation: ${A.pulse} 1s infinite;
    color: rgba(255, 255, 255, 0.4);
  }
`;

// 빛의 폭발 효과 스타일
const BurstEffect = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #fff 0%, rgba(49, 130, 246, 0.2) 50%, rgba(255, 215, 0, 0) 100%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  animation: ${A.lightRadial} 1s ease-out forwards;
`;

const CollectionStep: React.FC = () => {
  const { resetToMain, navigateTo } = useNavigation();
  const { talismanData, justUnlockedHidden, setJustUnlockedHidden, unlockHiddenInState } = useTalisman();
  const [selectedTalisman, setSelectedTalisman] = useState<Talisman | null>(null);
  const [revealStage, setRevealStage] = useState<'none' | 'sealed' | 'shaking' | 'burst' | 'done'>('none');

  useEffect(() => {
    if (justUnlockedHidden) {
      const initTimer = setTimeout(() => setRevealStage('sealed'), 0);
      const shakeTimer = setTimeout(() => setRevealStage('shaking'), 800);
      const burstTimer = setTimeout(() => {
        setRevealStage('burst');
        unlockHiddenInState(); // 빛이 터지는 시점에 실제 데이터를 해금 상태로 변경
      }, 1800);
      const doneTimer = setTimeout(() => {
        setRevealStage('done');
        setJustUnlockedHidden(false);
      }, 3200);
      
      const resetTimer = setTimeout(() => {
        setRevealStage('none');
      }, 4700);
      
      return () => {
        clearTimeout(initTimer);
        clearTimeout(shakeTimer);
        clearTimeout(burstTimer);
        clearTimeout(doneTimer);
        clearTimeout(resetTimer);
      };
    }
  }, [justUnlockedHidden, setJustUnlockedHidden, unlockHiddenInState]);

  // 상용 기획: 해금 전 히든은 아예 노출하지 않음
  const displayData = useMemo(() => {
    const gradePriority: Record<string, number> = {
      hidden: 0,
      legend: 1,
      hero: 2,
      rare: 3,
      common: 4,
    };

    return [...talismanData]
      // 연출 중(justUnlockedHidden)일 때는 잠겨있더라도 히든을 보여줘야 함
      .filter(t => t.grade !== 'hidden' || t.unlocked || justUnlockedHidden) 
      .sort((a, b) => (gradePriority[a.grade] ?? 99) - (gradePriority[b.grade] ?? 99));
  }, [talismanData, justUnlockedHidden]);

  const unlockedCount = useMemo(() => talismanData.filter((t) => t.unlocked).length, [talismanData]);
  const totalCount = useMemo(() => talismanData.length, [talismanData]);

  return (
    <L.Content $shake={revealStage === 'shaking'}>
      <L.Title style={{ textAlign: 'left', width: '100%', marginBottom: '20px' }}>
        나의 보관함
      </L.Title>

      <S.ScrollArea>
        {/* 통계 카드 */}
        <div style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          border: '1px solid #f2f4f6',
          borderRadius: '24px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#3182f6',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <IoFileTrayFullOutline size={26} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7684', marginBottom: '2px' }}>
                획득한 부적
              </div>
              <div style={{ fontSize: '19px', fontWeight: 700, color: '#191f28' }}>
                {unlockedCount} / {totalCount}개
              </div>
            </div>
          </div>
          <button
            onClick={() => navigateTo('payment')}
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#3182f6',
              backgroundColor: '#e8f3ff',
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            히든 얻기
          </button>
        </div>

        {/* 부적 그리드 */}
        <S.TalismanGrid>
          {displayData.map((item) => {
            const isHidden = item.grade === 'hidden';
            // 연출 중인 히든 부적은 burst 단계 이전까지 강제로 잠금 상태 UI를 보여줌
            const isEffecting = isHidden && revealStage !== 'none' && revealStage !== 'burst' && revealStage !== 'done';
            const isVisuallyUnlocked = item.unlocked && !isEffecting;
            const currentRevealStage = (isHidden && revealStage !== 'none') ? revealStage : 'none';

            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <S.TalismanCard
                  $unlocked={isVisuallyUnlocked}
                  $bgColor={isVisuallyUnlocked ? GRADE_COLORS[item.grade].bg : GRADE_COLORS[item.grade].sub}
                  $isHidden={isHidden}
                  $revealStage={currentRevealStage}
                  onClick={() => (revealStage === 'done' || revealStage === 'none') ? setSelectedTalisman(item) : null}
                >
                  <img src={item.img} alt={item.name} />
                  
                  {currentRevealStage !== 'none' && (
                    <>
                      {(currentRevealStage === 'sealed' || currentRevealStage === 'shaking') && (
                        <SealedOverlay>
                          <IoSparkles className="sparkle-icon" size={32} />
                        </SealedOverlay>
                      )}
                      {currentRevealStage === 'burst' && <BurstEffect />}
                    </>
                  )}
                </S.TalismanCard>
                <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#333d4b' }}>
                  {(isVisuallyUnlocked && (revealStage === 'none' || revealStage === 'done')) ? item.name : '???'}
                </div>
              </div>
            );
          })}
        </S.TalismanGrid>
      </S.ScrollArea>

      <C.FixedButtonGroup>
        <C.MainButton onClick={resetToMain}>메인으로 돌아가기</C.MainButton>
      </C.FixedButtonGroup>

      {selectedTalisman && (
        <TalismanDetailModal talisman={selectedTalisman} onClose={() => setSelectedTalisman(null)} />
      )}
    </L.Content>
  );
};

export default CollectionStep;
