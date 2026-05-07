import React, { useState, useMemo } from 'react';
import { IoFileTrayFullOutline, IoRefresh, IoHelp } from 'react-icons/io5';
import main_fish from '../assets/main_image.png'; 
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
  const { 
    talismanData, 
    justUnlockedHidden, 
    setJustUnlockedHidden, 
    unlockHiddenInState,
    hasHiddenPass,
    refreshCollection
  } = useTalisman();
  const [selectedTalisman, setSelectedTalisman] = useState<Talisman | null>(null);
  const [revealStage, setRevealStage] = useState<'none' | 'sealed' | 'shaking' | 'burst' | 'done'>('none');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isLoggedIn = !!tokenStorage.get();

  const getFullImageUrl = (path: string) => {
    if (!path) return '/result_image.png';
    if (path.startsWith('http')) return path;
    const host = window.location.hostname;
    return `http://${host}:8080${path}`;
  };

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshCollection();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const gradePriority: Record<string, number> = {
    hidden: 0,
    legend: 1,
    rare: 2,
    common: 3,
  };

  React.useEffect(() => {
    if (justUnlockedHidden) {
      setRevealStage('sealed');
      const t1 = setTimeout(() => setRevealStage('shaking'), 1500); 
      const t2 = setTimeout(() => setRevealStage('burst'), 4500);   
      const t3 = setTimeout(() => {
        setRevealStage('done');
        unlockHiddenInState(); 
      }, 5500);
      const t4 = setTimeout(() => {
        setRevealStage('none');
        setJustUnlockedHidden(false);
      }, 8000);
      return () => [t1, t2, t3, t4].forEach(clearTimeout);
    }
  }, [justUnlockedHidden, setJustUnlockedHidden, unlockHiddenInState]);

  const displayData = useMemo(() => {
    const uniqueMap = new Map<number, Talisman>();
    talismanData.forEach(t => {
      if (!uniqueMap.has(t.id)) uniqueMap.set(t.id, t);
    });
    return Array.from(uniqueMap.values())
      .sort((a, b) => (gradePriority[a.grade] ?? 99) - (gradePriority[b.grade] ?? 99));
  }, [talismanData]);

  const unlockedCount = useMemo(() => talismanData.filter((t) => t.unlocked).length, [talismanData]);
  const totalCount = useMemo(() => displayData.length, [displayData]);

  if (!isLoggedIn) {
    return (
      <L.Content style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐟</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#191f28', marginBottom: '8px' }}>로그인이 필요해요</div>
          <C.MainButton onClick={() => navigateTo('main')}>메인으로 이동</C.MainButton>
        </div>
      </L.Content>
    );
  }

  return (
    <L.Content style={{ padding: 0 }}>
      {/* ✅ 상단 여백 축소 (내비게이션 바 아래 자연스럽게 위치) */}
      <div style={{ padding: '12px 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <L.Title style={{ textAlign: 'left', margin: 0, fontSize: '26px', fontWeight: 900 }}>나의 보관함</L.Title>
        <button onClick={handleManualRefresh} disabled={isRefreshing} style={{ background: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#8b95a1', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <IoRefresh size={18} style={{ transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s ease' }} />
          갱신
        </button>
      </div>

      <S.ScrollArea style={{ padding: '0 24px 140px' }}>
        <div style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #f2f4f6', borderRadius: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#3182f6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IoFileTrayFullOutline size={26} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7684' }}>획득한 부적</div>
              <div style={{ fontSize: '19px', fontWeight: 800 }}>{unlockedCount} / {totalCount}개</div>
            </div>
          </div>
          <button onClick={() => navigateTo('payment')} style={{ fontSize: '14px', fontWeight: 700, color: '#3182f6', background: '#e8f3ff', padding: '10px 16px', borderRadius: '12px' }}>히든 얻기</button>
        </div>

        <S.TalismanGrid style={{ gap: '20px 14px' }}>
          {displayData.map((item, index) => {
            const isCurrentlyUnlocking = (item.grade === 'hidden' && justUnlockedHidden);
            const isVisuallyUnlocked = isCurrentlyUnlocking ? revealStage === 'done' : item.unlocked;
            const currentRevealStage = isCurrentlyUnlocking ? revealStage : 'none';
            
            // 인덱스를 기반으로 미세하게 각도 조절 (예: -2도 ~ 2도)
            const rotation = ((index * 7) % 5) - 2;

            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <S.TalismanCard
                  $unlocked={isVisuallyUnlocked}
                  $bgColor={isVisuallyUnlocked ? GRADE_COLORS[item.grade].bg : '#f2f4f6'} 
                  $rotate={rotation}
                  $isHidden={item.grade === 'hidden'}
                  $revealStage={currentRevealStage}
                  onClick={() => !justUnlockedHidden && isVisuallyUnlocked && setSelectedTalisman(item)}
                  style={{ 
                    position: 'relative',
                    border: isVisuallyUnlocked ? `1px solid ${GRADE_COLORS[item.grade].sub}` : '1px solid #e5e8eb'
                  }}
                >
                  {isVisuallyUnlocked ? (
                    <img src={getFullImageUrl(item.img)} alt={item.name} />
                  ) : (
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={main_fish} alt="잠금" style={{ width: '60%', opacity: 0.05, filter: 'grayscale(1)' }} />
                      <div style={{ 
                        position: 'absolute', 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: '#ffffff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <IoHelp size={18} color="#adb5bd" />
                      </div>
                    </div>
                  )}
                  {isVisuallyUnlocked && item.count > 1 && (
                    <div style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#3182f6', color: 'white', fontSize: '11px', fontWeight: 900, padding: '2px 8px', borderRadius: '100px', border: '2.5px solid #ffffff', zIndex: 2, boxShadow: '0 2px 6px rgba(49, 130, 246, 0.3)' }}>
                      {item.count}
                    </div>
                  )}
                </S.TalismanCard>
                <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: isVisuallyUnlocked ? '#333d4b' : '#adb5bd', transform: `rotate(${rotation}deg)` }}>
                  {isVisuallyUnlocked ? item.name : '미해금'}
                </div>
              </div>
            );
          })}
        </S.TalismanGrid>
      </S.ScrollArea>

      <C.FixedButtonGroup style={{ paddingBottom: '32px' }}>
        <C.MainButton onClick={resetToMain} style={{ background: '#f2f4f6', color: '#4e5968' }}>메인으로 돌아가기</C.MainButton>
      </C.FixedButtonGroup>

      {selectedTalisman && (
        <TalismanDetailModal talisman={{...selectedTalisman, img: getFullImageUrl(selectedTalisman.img)}} onClose={() => setSelectedTalisman(null)} />
      )}
    </L.Content>
  );
};

export default CollectionStep;
