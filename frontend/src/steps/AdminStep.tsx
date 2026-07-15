import { useState, useEffect } from 'react';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import { getAdminUsers, getAdminUserDetail, updateAdminUserUnlock, updateAdminUserCredit, getAdminStats } from '../utils/api';
import { useNavigation } from '../hooks/useNavigation';
import { 
  IoArrowBack, IoSearch, IoCheckmarkCircleOutline, IoStatsChartOutline, IoPeopleOutline, IoTicketOutline, IoSparklesOutline 
} from 'react-icons/io5';

export default function AdminStep() {
  const { navigateTo } = useNavigation();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editCredit, setEditCredit] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [selectedErrorLog, setSelectedErrorLog] = useState<any>(null);
  
  // 🔒 [통계 조회 기간 동적 필터 상태 추가]
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchStats(range);
  }, [range]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers(1, search);
      setUsers(data.users || []);
    } catch (err: any) {
      console.error('[AdminStep] fetchUsers Error:', err);
      // 🔒 [보안장치] 관리자 권한 만료(403) 시 로그인 화면으로 리다이렉트
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('관리자 로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        navigateTo('admin_login');
        return;
      }
      alert('유저 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (currentRange = range) => {
    try {
      setLoading(true);
      const data = await getAdminStats(currentRange);
      setStats(data);
    } catch (err: any) {
      console.error('[AdminStep] fetchStats Error:', err);
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        navigateTo('admin_login');
      }
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

  const handleGift10Credits = async () => {
    if (!selectedUser) return;
    const newCredit = (selectedUser.credit || 0) + 10;
    try {
      await updateAdminUserCredit(selectedUser.id, newCredit);
      alert(`유저 #${selectedUser.id}에게 10 크레딧 패키지를 지급했습니다. (총 ${newCredit} 크레딧)`);
      handleSelectUser(selectedUser.id);
      fetchUsers();
    } catch (err) {
      alert('크레딧 패키지 지급에 실패했습니다.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f2f4f6', minHeight: '100vh', width: '100%', fontFamily: '"Pretendard", sans-serif' }}>
      {/* 1. 상단 바 헤더 */}
      <div style={{ padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e5e8eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: '#191f28' }}>
            🐟 액막이 명태 - 실시간 통합 운영자 대시보드 (PC)
          </h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* 🔒 [APM 동적 범위 필터 스위치] */}
            <div style={{ display: 'flex', background: '#f2f4f6', borderRadius: '10px', padding: '3px', gap: '2px' }}>
              {(['7d', '30d', '90d', 'all'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  style={{
                    border: 'none',
                    background: range === r ? '#ffffff' : 'transparent',
                    color: range === r ? '#191f28' : '#6b7684',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: range === r ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  {r === 'all' ? '전체' : `${r.replace('d', '일')}`}
                </button>
              ))}
            </div>

            <button 
              onClick={() => { fetchStats(range); fetchUsers(); }} 
              style={{ 
                backgroundColor: '#3182f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(49, 130, 246, 0.15)' 
              }}
            >
              대시보드 실시간 동기화
            </button>
          </div>
        </div>
      </div>

      {/* 2. 대시보드 본문 (PC 대화면에 적합하도록 1440px 확장) */}
      <div style={{ padding: '24px 40px', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
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

        {/* [B] 하단 2단 반응형 그리드 레이아웃 (짤림 방지용 auto-fit minmax) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
          
          {/* [B-1] 좌측 열: 유저 제어 및 등급 분포 분석 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
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

                  {/* 결제 우회 시뮬레이터 카드 */}
                  <div style={{ padding: '16px', backgroundColor: '#f4f6f8', borderRadius: '14px', border: '1px solid #e5e8eb' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#4e5968', marginBottom: '10px' }}>
                      ⚡ 모바일 결제 우회 시뮬레이터 (실시간 반영)
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                      <button 
                        onClick={handleGift10Credits}
                        style={{ width: '100%', backgroundColor: '#e8f3ff', color: '#3182f6', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        🐟 10 크레딧 패키지 지급 (+1,100원 충전 연출)
                      </button>
                      <button 
                        onClick={handleManualUnlock}
                        style={{ 
                          width: '100%', 
                          backgroundColor: selectedUser.hasHiddenPass ? '#e5e8eb' : '#f4edff', 
                          color: selectedUser.hasHiddenPass ? '#8b95a1' : '#a25df5', 
                          border: 'none', 
                          padding: '12px', 
                          borderRadius: '10px', 
                          fontSize: '13px', 
                          fontWeight: 800, 
                          cursor: selectedUser.hasHiddenPass ? 'default' : 'pointer' 
                        }}
                        disabled={selectedUser.hasHiddenPass}
                      >
                        {selectedUser.hasHiddenPass ? '🔒 히든 패키지 해금 완료 상태' : '🔒 히든 패키지 강제 해금 (2,200원 해금 연출)'}
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f2f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#8b95a1' }}>보유 크레딧 (수동 직접수정)</div>
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



          </div>
        </div>

        {/* 📈 [과거 기록 복구] 최근 30일 과거 종합 통계 추이 리포트 */}
        <Section title="📊 최근 30일간 과거 일별 통계 추이 리포트">
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e5e8eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', backgroundColor: '#fff' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e8eb', color: '#6b7684', fontWeight: 800 }}>
                  <th style={{ padding: '12px 16px' }}>기준 일자</th>
                  <th style={{ padding: '12px 16px' }}>신규 가입 유저</th>
                  <th style={{ padding: '12px 16px' }}>생성된 부적 수</th>
                  <th style={{ padding: '12px 16px' }}>AI 고민 상담 수</th>
                  <th style={{ padding: '12px 16px' }}>일일 활동 유저 (DAU)</th>
                </tr>
              </thead>
              <tbody>
                {stats && stats.dailyTrends && stats.dailyTrends.length > 0 ? (
                  [...stats.dailyTrends].reverse().map((trend: any) => (
                    <tr key={trend.date} style={{ borderBottom: '1px solid #f2f4f6', backgroundColor: '#fff' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 750, color: '#333d4b' }}>{trend.date}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: trend.newUsers > 0 ? '#3182f6' : '#8b95a1' }}>
                        {trend.newUsers > 0 ? `+${trend.newUsers}명` : '-'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: trend.amuletsIssued > 0 ? '#ff922b' : '#8b95a1' }}>
                        {trend.amuletsIssued > 0 ? `${trend.amuletsIssued}개` : '-'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: trend.consultations > 0 ? '#2ecc71' : '#8b95a1' }}>
                        {trend.consultations > 0 ? `${trend.consultations}건` : '-'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: trend.dau > 0 ? '#191f28' : '#8b95a1' }}>
                        {trend.dau > 0 ? `${trend.dau}명` : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#8b95a1', fontWeight: 700 }}>
                      최근 30일 내 수집된 트렌드 데이터가 존재하지 않습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 🔒 [APM & 빅데이터 정밀 분석 대시보드] */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* APM 성능 분석 패널 */}
          <Section title="⚡ APM 실시간 시스템 성능 지표 (API & DB 병목 진단)">
            {stats ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. API 응답 레이턴시 TOP 5 */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#4e5968', marginBottom: '10px' }}>
                    🐢 느린 API 응답 속도 (Latency TOP 5)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {stats.slowApis && stats.slowApis.length > 0 ? (
                      stats.slowApis.map((api: any, idx: number) => {
                        const maxVal = stats.slowApis[0]?.avgLatency || 1;
                        const pct = Math.min(100, Math.round((api.avgLatency / maxVal) * 100));
                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 650 }}>
                              <span style={{ fontFamily: 'monospace' }}>[{api.method}] {api.path}</span>
                              <span style={{ color: '#e74c3c' }}>{api.avgLatency}ms ({api.count}회)</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#f2f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #ff8787, #fa5252)', borderRadius: '4px' }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: '12px', color: '#8b95a1' }}>계측 데이터 없음</span>
                    )}
                  </div>
                </div>

                {/* 2. DB 쿼리 실행 병목 TOP 5 */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#4e5968', marginBottom: '10px' }}>
                    🗄️ 느린 DB 트랜잭션 수행 지연 (DB Query Latency TOP 5)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {stats.slowQueries && stats.slowQueries.length > 0 ? (
                      stats.slowQueries.map((q: any, idx: number) => {
                        const maxVal = stats.slowQueries[0]?.avgDbLatency || 1;
                        const pct = Math.min(100, Math.round((q.avgDbLatency / maxVal) * 100));
                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 650 }}>
                              <span style={{ fontFamily: 'monospace' }}>[{q.method}] {q.path}</span>
                              <span style={{ color: '#9c36b5' }}>총 {q.avgDbLatency}ms (평균 쿼리 {q.avgQueryCount}회)</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#f2f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #e5dbff, #9c36b5)', borderRadius: '4px' }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: '12px', color: '#8b95a1' }}>계측 데이터 없음</span>
                    )}
                  </div>
                </div>

                {/* 3. HTTP 상태 코드 분포 */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#4e5968', marginBottom: '8px' }}>
                    🚦 HTTP API 상태 코드 분포
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {stats.statusCodeStats && stats.statusCodeStats.length > 0 ? (
                      stats.statusCodeStats.map((sc: any, idx: number) => {
                        const isSuccess = sc.status >= 200 && sc.status < 300;
                        const isRedirection = sc.status >= 300 && sc.status < 400;
                        const isClientError = sc.status >= 400 && sc.status < 500;
                        const bgColor = isSuccess ? '#e5f9ed' : isRedirection ? '#fff4e6' : isClientError ? '#fff0f0' : '#f8f9fa';
                        const color = isSuccess ? '#00d082' : isRedirection ? '#fd7e14' : isClientError ? '#f04452' : '#8b95a1';
                        return (
                          <div key={idx} style={{ padding: '8px 12px', background: bgColor, color, borderRadius: '10px', fontSize: '12px', fontWeight: 800 }}>
                            HTTP {sc.status}: {sc.count}회
                          </div>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: '12px', color: '#8b95a1' }}>상태 코드 이력 없음</span>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#8b95a1', fontSize: '13px' }}>APM 로딩 중...</p>
            )}
          </Section>

          {/* 사용 시간대 및 요일 트래픽 패턴 */}
          <Section title="📅 사용 시간대 및 요일 분포 (usage_temporal_patterns)">
            {stats && stats.temporalPatterns ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 요일별 트래픽 분포 */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#4e5968', marginBottom: '10px' }}>
                    🗓️ 요일별 트래픽 분포
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', borderBottom: '1px solid #e5e8eb', paddingBottom: '24px', marginBottom: '4px' }}>
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => {
                      const found = stats.temporalPatterns.dayOfWeek.find((d: any) => d.day_name.toUpperCase().startsWith(day));
                      const count = found ? parseInt(found.count) : 0;
                      const maxVal = Math.max(...stats.temporalPatterns.dayOfWeek.map((d: any) => parseInt(d.count)), 1);
                      const barH = count > 0 ? Math.max(Math.round((count / maxVal) * 70), 4) : 4;
                      const dayKorMap: Record<string, string> = { MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일' };
                      return (
                        <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: count > 0 ? '#3182f6' : '#c0c8d2' }}>{count > 0 ? count : ''}</div>
                          <div style={{ width: '100%', height: `${barH}px`, background: count > 0 ? '#3182f6' : '#e5e8eb', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#191f28' }}>{dayKorMap[day]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 24시간대 트래픽 분포 */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#4e5968', marginBottom: '10px' }}>
                    ⏰ 24시간 시간대별 트래픽 분포 (심야 트래픽 대처용)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '100px', gap: '4px' }}>
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const found = stats.temporalPatterns.hourOfDay.find((h: any) => parseInt(h.hour) === hour);
                      const count = found ? parseInt(found.count) : 0;
                      const maxVal = Math.max(...stats.temporalPatterns.hourOfDay.map((h: any) => parseInt(h.count)), 1);
                      const pct = Math.round((count / maxVal) * 80);
                      
                      const isNight = hour >= 22 || hour <= 4; // 심야 트래픽 강조 (22시 ~ 4시)
                      
                      return (
                        <div key={hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '100%', height: `${pct}px`, background: isNight ? '#a25df5' : '#3182f6', opacity: count > 0 ? 1 : 0.2, borderRadius: '2px 2px 0 0' }} />
                          <div style={{ fontSize: '9px', color: '#8b95a1', transform: 'scale(0.85)' }}>{hour}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '11px', color: '#6b7684', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '8px', height: '8px', background: '#3182f6', borderRadius: '50%' }} /> 주간 트래픽
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '8px', height: '8px', background: '#a25df5', borderRadius: '50%' }} /> 심야 트래픽 (22시 ~ 04시)
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#8b95a1', fontSize: '13px' }}>시간대 지표 로딩 중...</p>
            )}
          </Section>

        </div>

        {/* 🔒 [결제 전환율 & 유입 공유인 랭킹] */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* 결제 전환율 Funnel */}
          <Section title="💎 결제 퍼널 전환율 분석 (충전소 CVR)">
            {stats && stats.paymentFunnel ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '20px', background: '#f9fafb', borderRadius: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#8b95a1', marginBottom: '6px' }}>충전소 진입</div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#191f28' }}>{stats.paymentFunnel.rechargePageClicks}회</div>
                  </div>
                  <div style={{ fontSize: '20px', color: '#adb5bd', fontWeight: 700 }}>➔</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#8b95a1', marginBottom: '6px' }}>결제 성공</div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#00d082' }}>{stats.paymentFunnel.paymentCompleted}회</div>
                  </div>
                  <div style={{ fontSize: '20px', color: '#adb5bd', fontWeight: 700 }}>=</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#8b95a1', marginBottom: '6px' }}>결제 CVR</div>
                    <div style={{ fontSize: '28px', fontWeight: 950, color: '#3182f6' }}>{stats.paymentFunnel.conversionRate}%</div>
                  </div>
                </div>
                <div style={{ width: '100%', height: '12px', background: '#e5e8eb', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${stats.paymentFunnel.conversionRate}%`, height: '100%', background: '#3182f6' }} />
                  <div style={{ width: `${100 - stats.paymentFunnel.conversionRate}%`, height: '100%', background: '#e5e8eb' }} />
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#8b95a1', fontSize: '13px' }}>퍼널 데이터 로딩 중...</p>
            )}
          </Section>

          {/* 친구 공유 유입 Referrer 랭킹 */}
          <Section title="🔗 카카오톡/공유하기 유입 랭킹 (Referrer TOP 5)">
            {stats && stats.referrerStats ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.referrerStats.length > 0 ? (
                  stats.referrerStats.map((ref: any, idx: number) => {
                    const maxVal = stats.referrerStats[0]?.count || 1;
                    const pct = Math.min(100, Math.round((ref.count / maxVal) * 100));
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                          <span>추천 유저: #{ref.referrer}</span>
                          <span style={{ color: '#3182f6' }}>+{ref.count}명 신규 유입</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#f2f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#3182f6', borderRadius: '4px' }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ textAlign: 'center', color: '#8b95a1', fontSize: '12px', padding: '20px 0' }}>공유 링크 유입 이력이 아직 없습니다.</p>
                )}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#8b95a1', fontSize: '13px' }}>유입 데이터 로딩 중...</p>
            )}
          </Section>

        </div>

        {/* 🔒 [코호트 재방문 분석 매트릭스 리포트] */}
        <Section title="📅 가입일 기준 경과일수별 코호트 재방문 분석 (Cohort Retention Heatmap)">
          {stats && stats.cohortStats ? (
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e5e8eb' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px', backgroundColor: '#fff' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e8eb', color: '#6b7684', fontWeight: 800 }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>가입 일자</th>
                    <th style={{ padding: '12px 16px' }}>획득 수 (Cohort Size)</th>
                    <th style={{ padding: '12px 16px' }}>당일 (Day 0)</th>
                    <th style={{ padding: '12px 16px' }}>1일차 (Day 1)</th>
                    <th style={{ padding: '12px 16px' }}>7일차 (Day 7)</th>
                    <th style={{ padding: '12px 16px' }}>14일차 (Day 14)</th>
                    <th style={{ padding: '12px 16px' }}>30일차 (Day 30)</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.cohortStats.length > 0 ? (
                    stats.cohortStats.map((cohort: any) => {
                      const size = parseInt(cohort.cohortSize) || 0;
                      
                      const getRetentionDetails = (dayVal: number) => {
                        if (size === 0) return { pct: 0, bg: 'transparent', color: '#8b95a1' };
                        const rawPct = (dayVal / size) * 100;
                        const pct = parseFloat(rawPct.toFixed(1));
                        
                        const opacity = Math.min(1.0, Math.max(0.0, rawPct / 100));
                        const bg = opacity > 0 ? `rgba(49, 130, 246, ${opacity * 0.85 + 0.15})` : 'transparent';
                        const color = opacity > 0.4 ? '#ffffff' : '#191f28';
                        
                        return { pct, bg, color };
                      };

                      const d0Info = getRetentionDetails(cohort.d0);
                      const d1Info = getRetentionDetails(cohort.d1);
                      const d7Info = getRetentionDetails(cohort.d7);
                      const d14Info = getRetentionDetails(cohort.d14);
                      const d30Info = getRetentionDetails(cohort.d30);

                      return (
                        <tr key={cohort.joinDate} style={{ borderBottom: '1px solid #f2f4f6' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: '#333d4b', textAlign: 'left' }}>{cohort.joinDate}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#191f28', backgroundColor: '#f8f9fa' }}>{size}명</td>
                          
                          <td style={{ padding: '12px 16px', fontWeight: 800, backgroundColor: d0Info.bg, color: d0Info.color }}>{d0Info.pct}%</td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, backgroundColor: d1Info.bg, color: d1Info.color }}>{d1Info.pct}%</td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, backgroundColor: d7Info.bg, color: d7Info.color }}>{d7Info.pct}%</td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, backgroundColor: d14Info.bg, color: d14Info.color }}>{d14Info.pct}%</td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, backgroundColor: d30Info.bg, color: d30Info.color }}>{d30Info.pct}%</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#8b95a1', fontWeight: 700 }}>
                        수집된 코호트 재방문 이력이 존재하지 않습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#8b95a1', fontSize: '13px' }}>코호트 리포트 로딩 중...</p>
          )}
        </Section>

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
    <div style={{ 
      backgroundColor: '#fff', 
      padding: '18px', 
      borderRadius: '16px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)', 
      marginBottom: '16px',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
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
