import React, { useState, useMemo } from 'react';
import { IoFileTrayFullOutline } from 'react-icons/io5';
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import type { Talisman } from '../types/index';
import { GRADE_COLORS } from '../constants/talisman';
import { TalismanDetailModal } from '../components/Overlays';
import { useNavigation } from '../hooks/useNavigation';
import { useTalisman } from '../hooks/useTalisman';
import { tokenStorage } from '../utils/api';

const CollectionStep: React.FC = () => {
  const { resetToMain, navigateTo } = useNavigation();
  const { talismanData } = useTalisman();
  const [selectedTalisman, setSelectedTalisman] = useState<Talisman | null>(null);

  // ✅ 컴포넌트 안에서 로그인 체크
  const isLoggedIn = !!tokenStorage.get();

  const gradePriority: Record<string, number> = {
    legend: 0,
    rare: 1,
    common: 2,
  };

  const displayData = useMemo(() => {
    return [...talismanData]
      .filter(t => t.grade !== 'hidden')
      .sort((a, b) => (gradePriority[a.grade] ?? 99) - (gradePriority[b.grade] ?? 99));
  }, [talismanData]);

  const unlockedCount = useMemo(() => talismanData.filter((t) => t.unlocked).length, [talismanData]);
  const totalCount = useMemo(() => displayData.length, [displayData]);

  // ✅ 로그인 안 된 경우
  if (!isLoggedIn) {
    return (
      <L.Content style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐟</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#191f28', marginBottom: '8px' }}>
            로그인이 필요해요
          </div>
          <div style={{ fontSize: '14px', color: '#6b7684', marginBottom: '32px' }}>
            보관함을 보려면 토스 로그인을 해주세요
          </div>
          <C.MainButton onClick={() => navigateTo('main')}>
            메인으로 이동
          </C.MainButton>
        </div>
      </L.Content>
    );
  }

  return (
    <L.Content>
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
            const isVisuallyUnlocked = item.unlocked;
            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <S.TalismanCard
                  $unlocked={isVisuallyUnlocked}
                  $bgColor={isVisuallyUnlocked ? GRADE_COLORS[item.grade].bg : GRADE_COLORS[item.grade].sub}
                  $isHidden={false}
                  $revealStage="none"
                  onClick={() => setSelectedTalisman(item)}
                >
                  <img src={item.img} alt={item.name} />
                </S.TalismanCard>
                <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#333d4b' }}>
                  {isVisuallyUnlocked ? item.name : '???'}
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