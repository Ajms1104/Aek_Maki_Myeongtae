import { useState, useEffect } from 'react';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import { getAdminUsers, getAdminUserDetail, updateAdminUserUnlock, updateAdminUserCredit, getAdminStats } from '../utils/api';
import { 
  IoArrowBack, IoSearch, IoCheckmarkCircleOutline, IoStatsChartOutline, IoPeopleOutline, IoTicketOutline, IoSparklesOutline 
} from 'react-icons/io5';

export default function AdminStep() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editCredit, setEditCredit] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [selectedErrorLog, setSelectedErrorLog] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers(1, search);
      setUsers(data.users || []);
    } catch (err) {
      console.error('[AdminStep] fetchUsers Error:', err);
      alert('유저 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('[AdminStep] fetchStats Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (userId: string) => {
    try {
      const detail = await getAdminUserDetail(userId);
      setSelectedUser(detail);
      setEditCredit(detail.credit?.toString() || '0');
    } catch (err) {
      console.error('[AdminStep] handleSelectUser Error:', err);
      alert('유저 상세 정보를 불러오지 못했습니다.');
    }
  };

  const handleUpdateCredit = async () => {
    if (!selectedUser) return;
    const newCredit = parseInt(editCredit);
    if (isNaN(newCredit) || newCredit < 0) {
      alert('올바른 크레딧 값을 입력해주세요.');
      return;
    }

    try {
      await updateAdminUserCredit(selectedUser.id, newCredit);
      alert(`유저 #${selectedUser.id}의 크레딧이 ${newCredit}으로 변경되었습니다.`);
      setSelectedUser({ ...selectedUser, credit: newCredit });
      fetchUsers();
    } catch (err) {
      alert('크레딧 수정에 실패했습니다.');
    }
  };

  const handleManualUnlock = async () => {
    if (!selectedUser) return;
    if (!confirm('결제 오류 해결을 위해 이 유저의 히든 부적을 강제로 해금할까요?')) return;
    try {
      await updateAdminUserUnlock(selectedUser.id, true);
      alert('해금이 완료되었습니다.');
      handleSelectUser(selectedUser.id);
      fetchUsers();
    } catch (err) {
      alert('해금 처리에 실패했습니다.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f2f4f6', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', fontFamily: '"Pretendard", sans-serif' }}>
      {/* 1. 상단 바 헤더 */}
      <div style={{ padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e5e8eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: '#191f28' }}>
            🐟 액막이 명태 - 실시간 통합 운영자 대시보드 (PC)
          </h1>
          <button 
            onClick={() => { fetchStats(); fetchUsers(); }} 
            style={{ 
              backgroundColor: '#3182f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(49, 130, 246, 0.15)' 
            }}
          >
            대시보드 실시간 동기화
          </button>
        </div>
      </div>

      {/* 2. 대시보드 본문 (PC 대화면에 적합하도록 1440px 확장) */}
      <div style={{ flex: 1, padding: '24px 40px', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* [A] 상단 통합 지표 카드 (접속 즉시 한눈에 노출) */}
        {stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            <StatCard icon={<IoPeopleOutline color="#3182f6" size={18} />} label="전체 유저 수" value={stats.totalUsers} />
            <StatCard icon={<IoSparklesOutline color="#ff922b" size={18} />} label="발급된 총 부적" value={stats.totalAmuletsIssued} />
            <StatCard icon={<IoTicketOutline color="#2ecc71" size={18} />} label="누적 상담 건수" value={stats.totalConsultations} />
            <StatCard icon={<IoPeopleOutline color="#3182f6" size={18} />} label="오늘 신규 가입" value={stats.todayNewUsers} />
            <StatCard icon={<IoStatsChartOutline color="#e74c3c" size={18} />} label="평균 체류 시간" value={`${stats.avgDurationSeconds || 0}초`} />
          </div>
        ) : (
          <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '16px', textAlign: 'center', color: '#8b95a1' }}>종합 대시보드 지표 로딩 중...</div>
        )}

        {/* [B] 하단 2단 반응형 그리드 레이아웃 (40% : 60%) */}
        <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: '20px', alignItems: 'flex-start' }}>
          
          {/* [B-1] 좌측 열: 유저 제어 및 등급 분포 분석 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Section title="👥 실시간 유저 조회 및 마스터 제어">
              {selectedUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <button 
                      onClick={() => setSelectedUser(null)} 
                      style={{ border: 'none', background: '#f2f4f6', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ← 목록으로
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#333d4b' }}>유저 #{selectedUser.id} 제어판</span>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#191f28', marginBottom: '10px' }}>
                      히든 해금 상태: <span style={{ color: selectedUser.hasHiddenPass ? '#27ae60' : '#f04452' }}>{selectedUser.hasHiddenPass ? '해금 완료' : '잠금'}</span>
                    </div>
                    {!selectedUser.hasHiddenPass && (
                      <C.Button onClick={handleManualUnlock} $variant="primary" style={{ backgroundColor: '#3182f6', height: '40px', width: '100%', fontSize: '13px', borderRadius: '8px' }}>
                        히든 부적 강제 해금하기
                      </C.Button>
                    )}
                  </div>

                  <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#8b95a1' }}>보유 크레딧</div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#191f28' }}>{selectedUser.credit}개</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input 
                          type="number" 
                          style={{ width: '60px', padding: '8px', borderRadius: '6px', border: '1px solid #e5e8eb', fontSize: '14px', fontWeight: 750, textAlign: 'center', outline: 'none' }} 
                          value={editCredit} 
                          onChange={(e) => setEditCredit(e.target.value)} 
                        />
                        <button onClick={handleUpdateCredit} style={{ padding: '8px 12px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>수정</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#4e5968', marginBottom: '6px' }}>유저 정보</div>
                    <DataRow label="Toss Key" value={selectedUser.tossUserKey.substring(0, 15) + '...'} />
                    <DataRow label="누적 상담" value={`${selectedUser.consultationCount}회`} />
                    <DataRow label="가입일" value={new Date(selectedUser.createdAt).toLocaleDateString()} />
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#4e5968', marginBottom: '6px' }}>보유 부적 도감 ({selectedUser.amuletCount}개)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                      {selectedUser.amulets?.length > 0 ? (
                        selectedUser.amulets.map((a: any) => (
                          <div key={a.userAmuletId} style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f2f4f6', fontSize: '11px', textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                            <div style={{ color: '#3182f6', fontWeight: 750, marginTop: '2px' }}>{a.count}개</div>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: '12px', color: '#8b95a1' }}>도감 없음</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <IoSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#adb5bd' }} size={16} />
                    <input 
                      style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e5e8eb', fontSize: '14px', outline: 'none' }} 
                      placeholder="유저 ID 또는 Toss 식별 Key" 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                    {loading ? (
                      <p style={{ textAlign: 'center', padding: '20px', color: '#8b95a1', fontSize: '13px' }}>검색 중...</p>
                    ) : users.map((u: any) => (
                      <div key={u.id} style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '12px', border: '1px solid #f2f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#191f28' }}>ID: #{u.id} {u.isDeleted && '(탈퇴)'}</div>
                          <div style={{ fontSize: '11px', color: '#8b95a1', fontFamily: 'monospace' }}>{u.tossUserKey.substring(0, 12)}...</div>
                        </div>
                        <button onClick={() => handleSelectUser(u.id)} style={{ backgroundColor: '#3182f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>상세</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* 부적 분포 원형 도넛 차트 */}
            <Section title="📊 부적 등급별 누적 발급 비중 (시각 분석)">
              {stats ? (
                <DonutChart data={stats.gradeDistribution || {}} />
              ) : (
                <p style={{ textAlign: 'center', color: '#8b95a1', fontSize: '13px' }}>통계 로딩 중...</p>
              )}
            </Section>
          </div>

          {/* [B-2] 우측 열: 트래픽 막대 그래프 및 로그 타임라인 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 최근 7일 DAU 트래픽 추이 막대그래프 */}
            <Section title="📈 최근 7일간 일별 활동 유저 수 (DAU 트래픽)">
              {stats ? (
                <DauBarChart dauData={stats.dauStats || []} />
              ) : (
                <p style={{ textAlign: 'center', color: '#8b95a1', fontSize: '13px' }}>트래픽 데이터 로딩 중...</p>
              )}
            </Section>

            {/* 실시간 접속 및 이용 여정 타임라인 */}
            <Section title="⚡ 실시간 접속 및 이용 현황 (유저 여정 로그)">
              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats && stats.recentAccessLogs && stats.recentAccessLogs.length > 0 ? (
                  stats.recentAccessLogs.map((log: any) => (
                    <div 
                      key={log.id} 
                      style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '12px', border: '1px solid #f2f4f6', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontWeight: 700, color: '#4c566a' }}>
                        <span>User: #{log.userId} ({log.tossUserKey ? log.tossUserKey.substring(0, 16) + '...' : 'Guest'})</span>
                        <span style={{ fontSize: '10px', color: '#8b95a1' }}>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#191f28', marginTop: '2px' }}>
                        <span style={{ fontWeight: 650 }}>액션: <span style={{ color: '#3182f6' }}>{log.action}</span></span>
                        {log.action === 'APP_LEAVE' && (
                          <span style={{ color: '#e74c3c', fontWeight: 750 }}>{log.durationSeconds}초 체류</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#8b95a1', fontSize: '12px', padding: '20px 0' }}>수집된 접속 로그가 없습니다.</p>
                )}
              </div>
            </Section>

            {/* 시스템 에러 로그 모니터링 */}
            <Section title="🚨 최근 서버 에러 로그 모니터링">
              <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {stats && stats.recentSystemLogs && stats.recentSystemLogs.length > 0 ? (
                  stats.recentSystemLogs.map((log: any) => (
                    <div 
                      key={log.id} 
                      style={{ 
                        padding: '6px 8px', 
                        backgroundColor: '#fff0f0', 
                        borderLeft: '3px solid #f04452', 
                        borderRadius: '4px',
                        fontSize: '11px',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ color: '#f04452', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.message}</div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#8b95a1', fontSize: '11px', padding: '10px 0' }}>에러 없음</p>
                )}
              </div>
            </Section>

          </div>
        </div>

      </div>
    </div>
  );
}

// 📊 SVG 기반 부적 등급 분포 도넛 차트 컴포넌트
function DonutChart({ data }: { data: { legend?: number, rare?: number, hidden?: number, common?: number } }) {
  const total = (data.legend || 0) + (data.rare || 0) + (data.hidden || 0) + (data.common || 0);
  if (total === 0) return <div style={{ textAlign: 'center', color: '#8b95a1', fontSize: '13px', padding: '20px' }}>데이터 없음</div>;

  const legendPct = Math.round(((data.legend || 0) / total) * 100);
  const rarePct = Math.round(((data.rare || 0) / total) * 100);
  const hiddenPct = Math.round(((data.hidden || 0) / total) * 100);
  const commonPct = Math.round(((data.common || 0) / total) * 100);

  const radius = 40;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  const grades = [
    { name: '전설 부적', count: data.legend || 0, pct: legendPct, color: '#ff922b' },
    { name: '희귀 부적', count: data.rare || 0, pct: rarePct, color: '#3182f6' },
    { name: '히든 부적', count: data.hidden || 0, pct: hiddenPct, color: '#a25df5' },
    { name: '일반 부적', count: data.common || 0, pct: commonPct, color: '#8b95a1' }
  ];

  let accumulatedPercent = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '10px 0' }}>
      <div style={{ position: 'relative', width: '130px', height: '130px' }}>
        <svg width="130" height="130" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          {grades.map((g, idx) => {
            if (g.count === 0) return null;
            const strokeLength = (g.count / total) * circumference;
            const strokeOffset = circumference - strokeLength + (accumulatedPercent / total) * circumference;
            accumulatedPercent -= g.count;

            return (
              <circle
                key={idx}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={g.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              />
            );
          })}
        </svg>
        <div style={{ position: 'absolute', top: '53%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#8b95a1', fontWeight: 700 }}>총 발급</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#191f28' }}>{total}개</div>
        </div>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {grades.map((g, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: g.color }} />
              <span style={{ fontWeight: 700, color: '#4e5968' }}>{g.name}</span>
            </div>
            <span style={{ fontWeight: 800, color: '#333d4b' }}>{g.count}개 ({g.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 📈 SVG 기반 7일 DAU 트래픽 막대 그래프 컴포넌트
function DauBarChart({ dauData }: { dauData: Array<{ date: string, count: number }> }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!dauData || dauData.length === 0) {
    return <div style={{ textAlign: 'center', color: '#8b95a1', fontSize: '13px', padding: '40px 0' }}>최근 7일 트래픽 데이터가 없습니다.</div>;
  }

  // 최근 날짜 순 정렬 (오름차순)
  const sortedData = [...dauData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const maxCount = Math.max(...sortedData.map(d => d.count), 1);

  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', paddingBottom: '10px', borderBottom: '1px solid #e5e8eb', position: 'relative' }}>
        {sortedData.map((d, idx) => {
          const dayName = new Date(d.date).toLocaleDateString('ko-KR', { weekday: 'short' });
          const barHeight = (d.count / maxCount) * 100; // 최대 높이 100px 비례

          return (
            <div 
              key={idx} 
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* 툴팁 */}
              {hoveredIdx === idx && (
                <div style={{
                  position: 'absolute',
                  top: `${90 - barHeight}px`,
                  backgroundColor: '#191f28',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  zIndex: 20,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  transform: 'translateY(-100%)'
                }}>
                  {d.count}명 활성
                </div>
              )}

              {/* 막대 바 */}
              <div style={{
                width: '32px',
                height: `${barHeight}px`,
                backgroundColor: hoveredIdx === idx ? '#1a6dde' : '#3182f6',
                borderRadius: '6px 6px 0 0',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(49, 130, 246, 0.1)'
              }} />

              {/* 요일 및 날짜 */}
              <div style={{ fontSize: '11px', color: '#4e5968', fontWeight: 800, marginTop: '8px' }}>
                {dayName}
              </div>
              <div style={{ fontSize: '9px', color: '#adb5bd', marginTop: '2px', fontWeight: 600 }}>
                {d.date.substring(5)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{icon}<span style={{ fontSize: '12px', color: '#8b95a1', fontWeight: 600 }}>{label}</span></div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: '#191f28' }}>{value.toLocaleString()}</div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', marginBottom: '16px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 12px 0', color: '#191f28' }}>{title}</h3>
      {children}
    </div>
  );
}

function DataRow({ label, value }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
      <span style={{ fontSize: '14px', color: '#8b95a1', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 700, color: '#333d4b' }}>{value}</span>
    </div>
  );
}
