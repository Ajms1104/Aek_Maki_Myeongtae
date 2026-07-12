import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { useTossBanner } from '../hooks/useTossBanner';

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

  // ✅ 토스 광고 배너 연동
  const bannerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, attachBanner } = useTossBanner();

  useEffect(() => {
    if (!isInitialized || !bannerRef.current) return;
    const attached = attachBanner('ait.v2.live.71baf9f8b7fe466d', bannerRef.current, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: 'expanded',
      callbacks: { onAdFailedToRender: (payload) => console.error('보관함 광고 렌더링 실패:', payload) },
    });
    return () => { attached?.destroy(); };
  }, [isInitialized, attachBanner]);

  const isLoggedIn = !!tokenStorage.get();

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

  useEffect(() => {
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
      <L.Content style={{ alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)' }}>
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐟</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#191f28', marginBottom: '8px' }}>로그인이 필요해요</div>
          <C.MainButton onClick={() => navigateTo('main')}>메인으로 이동</C.MainButton>
        </div>
      </L.Content>
    );
  }

  return (
    <L.Content style={{ padding: 0, background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)' }}>
      <div style={{ padding: '12px 24px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <L.Title style={{ textAlign: 'left', margin: 0, fontSize: '26px', fontWeight: 900 }}>나의 보관함</L.Title>
        <button onClick={handleManualRefresh} disabled={isRefreshing} style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#8b95a1', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <IoRefresh size={18} style={{ transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s ease' }} />
          갱신
        </button>
      </div>

      <S.ScrollArea style={{ padding: '10px 24px 140px' }}>
        {/* 획득 현황 프리미엄 대시보드 카드화 */}
        <div style={{ 
          padding: '20px 24px', 
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
          borderRadius: '24px', 
          marginBottom: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IoFileTrayFullOutline size={26} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>획득한 부적</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>{unlockedCount} / {totalCount}개</div>
            </div>
          </div>
          <button onClick={() => navigateTo('payment')} style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', background: '#3182f6', padding: '10px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(49, 130, 246, 0.25)' }}>히든 얻기</button>
        </div>

        <S.TalismanGrid style={{ gap: '20px 14px' }}>
          {displayData.map((item, index) => {
            const isCurrentlyUnlocking = (item.grade === 'hidden' && justUnlockedHidden);
            const isVisuallyUnlocked = isCurrentlyUnlocking ? revealStage === 'done' : item.unlocked;
            const currentRevealStage = isCurrentlyUnlocking ? revealStage : 'none';
            const rotation = ((index * 7) % 5) - 2;

            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <S.TalismanCard
                  $unlocked={isVisuallyUnlocked}
                  $bgColor={isVisuallyUnlocked ? GRADE_COLORS[item.grade].bg : '#f8f9fa'} 
                  $rotate={rotation}
                  $isHidden={item.grade === 'hidden'}
                  $revealStage={currentRevealStage}
                  onClick={() => !justUnlockedHidden && isVisuallyUnlocked && setSelectedTalisman(item)}
                  style={{ 
                    position: 'relative',
                    border: isVisuallyUnlocked ? `1.5px solid ${GRADE_COLORS[item.grade].sub}` : '1.5px dashed #e2e8eb',
                    boxShadow: isVisuallyUnlocked ? '0 8px 16px rgba(0,0,0,0.04)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {isVisuallyUnlocked ? (
                    <img 
                      src={item.img} 
                      alt={item.name} 
                      loading="lazy" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={main_fish} alt="잠금" style={{ width: '55%', opacity: 0.04, filter: 'grayscale(1)' }} />
                      <div style={{ 
                        position: 'absolute', 
                        width: '30px', 
                        height: '30px', 
                        borderRadius: '50%', 
                        background: '#ffffff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                      }}>
                        <IoHelp size={16} color="#adb5bd" />
                      </div>
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

      <C.FixedButtonGroup style={{ padding: '16px 24px 32px', backgroundColor: '#ffffff', borderTop: '1px solid #f2f4f6', flexDirection: 'column', gap: '10px' }}>
        {/* 토스 배너 광고 지면 (버튼 클릭 실수 유도용 배치) */}
        <div 
          ref={bannerRef} 
          style={{ 
            width: '100%', 
            minHeight: '64px', 
            borderRadius: '16px', 
            overflow: 'hidden',
            border: '1px solid #f2f4f6',
            boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
            backgroundColor: '#ffffff'
          }} 
        />
        <C.MainButton onClick={resetToMain} style={{ background: '#3182f6', color: '#ffffff', height: '56px', borderRadius: '16px' }}>메인으로 돌아가기</C.MainButton>
      </C.FixedButtonGroup>

      {selectedTalisman && (
        <TalismanDetailModal talisman={selectedTalisman} onClose={() => setSelectedTalisman(null)} />
      )}
    </L.Content>
  );
};

export default CollectionStep;
