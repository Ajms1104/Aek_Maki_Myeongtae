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
  const [showStats, setShowStats] = useState(false);
  const [selectedErrorLog, setSelectedErrorLog] = useState<any>(null);

  useEffect(() => {
    if (!selectedUser && !showStats) fetchUsers();
    if (showStats) fetchStats();
  }, [selectedUser, showStats]);

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
      setShowStats(false);
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
    } catch (err) {
      alert('해금 처리에 실패했습니다.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f2f4f6', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', fontFamily: '"Pretendard", sans-serif' }}>
      {/* 관리자 헤더 */}
      <div style={{ padding: '24px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e5e8eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {(selectedUser || showStats) && <IoArrowBack size={24} onClick={() => { setSelectedUser(null); setShowStats(false); }} style={{ cursor: 'pointer', color: '#4e5968' }} />}
            <h1 style={{ fontSize: '22px', fontWeight: 900, margin: 0, color: '#191f28' }}>
              {selectedUser ? `유저 상세 정보 (#${selectedUser.id})` : showStats ? '서비스 통합 통계' : '액막이 명태 - 시스템 운영 관리 도구'}
            </h1>
          </div>
          {!selectedUser && !showStats && (
            <button 
              onClick={() => setShowStats(true)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                backgroundColor: '#e8f3ff', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '10px', 
                color: '#3182f6', 
                fontWeight: 700, 
                cursor: 'pointer' 
              }}
            >
              <IoStatsChartOutline size={18} /> 서비스 통계 보기
            </button>
          )}
        </div>
      </div>

      {/* 관리자 메인 콘텐츠 컨테이너 */}
      <div style={{ flex: 1, padding: '32px 40px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {showStats && stats ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 통계 메트릭 반응형 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <StatCard icon={<IoPeopleOutline color="#3182f6" size={20} />} label="전체 회원 수" value={stats.totalUsers} />
              <StatCard icon={<IoSparklesOutline color="#ff922b" size={20} />} label="총 발급 부적" value={stats.totalAmuletsIssued} />
              <StatCard icon={<IoTicketOutline color="#2ecc71" size={20} />} label="누적 상담 건수" value={stats.totalConsultations} />
              <StatCard icon={<IoPeopleOutline color="#3182f6" size={20} />} label="오늘 신규 가입" value={stats.todayNewUsers} />
              <StatCard icon={<IoStatsChartOutline color="#e74c3c" size={20} />} label="평균 체류 시간" value={`${stats.avgDurationSeconds || 0}초`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              <Section title="부적 등급 분포 현황">
                {Object.entries(stats.gradeDistribution || {}).map(([grade, count]: any) => (
                  <div key={grade} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f9fafb' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, textTransform: 'capitalize', color: '#333d4b' }}>
                      {grade === 'legend' ? '👑 LEGEND (전설)' : grade === 'rare' ? '✨ RARE (희귀)' : grade === 'hidden' ? '🔒 HIDDEN (히든)' : '🐟 COMMON (일반)'}
                    </span>
                    <span style={{ fontSize: '14px', color: '#3182f6', fontWeight: 800 }}>{count}개</span>
                  </div>
                ))}
              </Section>

              {/* 실시간 시스템 에러 로그 패널 */}
              <Section title="최근 시스템 오류 로그 (실시간 디버깅)">
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stats.recentSystemLogs && stats.recentSystemLogs.length > 0 ? (
                    stats.recentSystemLogs.map((log: any) => (
                      <div 
                        key={log.id} 
                        onClick={() => setSelectedErrorLog(selectedErrorLog?.id === log.id ? null : log)}
                        style={{ 
                          padding: '12px', 
                          backgroundColor: '#fff0f0', 
                          borderLeft: '4px solid #f04452', 
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 700, color: '#f04452' }}>
                          <span>[{log.level}] {log.tossUserKey ? `User: ${log.tossUserKey.substring(0, 8)}...` : 'GUEST'}</span>
                          <span style={{ fontSize: '10px', color: '#8b95a1' }}>{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div style={{ fontWeight: 650, color: '#333d4b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.message}</div>
                        
                        {selectedErrorLog?.id === log.id && log.data && (
                          <pre style={{ marginTop: '8px', padding: '10px', backgroundColor: '#222', color: '#fff', borderRadius: '6px', overflowX: 'auto', fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', textAlign: 'left', lineHeight: '1.4' }}>
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: 'center', color: '#8b95a1', fontSize: '13px', padding: '20px 0' }}>오류 로그가 없습니다.</p>
                  )}
                </div>
              </Section>
            </div>

            {/* 접속 로그 현황 패널 */}
            <Section title="실시간 사용자 활동 및 체류 로그">
              <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.recentAccessLogs && stats.recentAccessLogs.length > 0 ? (
                  stats.recentAccessLogs.map((log: any) => (
                    <div 
                      key={log.id} 
                      style={{ 
                        padding: '12px', 
                        backgroundColor: '#f9fafb', 
                        borderRadius: '8px',
                        fontSize: '13px',
                        border: '1px solid #f2f4f6',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 700, color: '#4a5568' }}>
                        <span>ID: #{log.userId} ({log.tossUserKey ? log.tossUserKey.substring(0, 16) + '...' : 'Guest Session'})</span>
                        <span style={{ fontSize: '11px', color: '#8b95a1' }}>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#191f28', marginTop: '6px' }}>
                        <span style={{ fontWeight: 750 }}>액션: <span style={{ color: '#3182f6' }}>{log.action}</span></span>
                        {log.action === 'APP_LEAVE' && (
                          <span style={{ color: '#4e5968', fontWeight: 600 }}>총 체류 시간: <strong style={{ color: '#e74c3c' }}>{log.durationSeconds}초</strong></span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#8b95a1', fontSize: '13px', padding: '20px 0' }}>활동 로그가 없습니다.</p>
                )}
              </div>
            </Section>
          </div>
        ) : selectedUser ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '16px', border: '2px solid #e8f3ff', boxShadow: '0 4px 12px rgba(49, 130, 246, 0.05)' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#191f28', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IoCheckmarkCircleOutline color="#3182f6" size={24} />
                  히든 부적 패키지 구매 상태: <span style={{ color: selectedUser.hasHiddenPass ? '#27ae60' : '#f04452' }}>{selectedUser.hasHiddenPass ? '해금 완료' : '미구매 (잠금)'}</span>
                </div>
                {!selectedUser.hasHiddenPass && (
                  <C.Button onClick={handleManualUnlock} $variant="primary" style={{ backgroundColor: '#3182f6', height: '48px', width: '100%', borderRadius: '12px', fontSize: '15px', fontWeight: 800 }}>
                    히든 부적 즉시 강제 해금하기
                  </C.Button>
                )}
              </div>
              
              <Section title="보유 크레딧 조작 및 관리">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '8px 0' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#8b95a1', marginBottom: '4px', fontWeight: 600 }}>현재 크레딧</div>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: '#191f28' }}>{selectedUser.credit}개</div>
                  </div>
                  <div style={{ flex: 1.5, display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e8eb', fontSize: '16px', fontWeight: 700, outline: 'none', textAlign: 'center' }} 
                      value={editCredit} 
                      onChange={(e) => setEditCredit(e.target.value)} 
                    />
                    <button 
                      onClick={handleUpdateCredit} 
                      style={{ padding: '0 20px', height: '44px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      수정 적용
                    </button>
                  </div>
                </div>
              </Section>
              
              <Section title="유저 기본 마스터 정보">
                <DataRow label="회원 번호 (ID)" value={selectedUser.id} />
                <DataRow label="Toss User 식별 Key" value={selectedUser.tossUserKey} />
                <DataRow label="누적 부적 제작 횟수" value={`${selectedUser.consultationCount}회`} />
                <DataRow label="최초 가입일" value={new Date(selectedUser.createdAt).toLocaleString()} />
              </Section>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Section title={`유저 획득 부적 도감 (${selectedUser.amuletCount}개)`}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                  {selectedUser.amulets?.length > 0 ? (
                    selectedUser.amulets.map((a: any) => (
                      <div key={a.userAmuletId} style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #f2f4f6', textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#333d4b', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                        <div style={{ fontSize: '11px', color: '#8b95a1', fontWeight: 700 }}>
                          <span style={{ 
                            color: a.grade === 'legend' ? '#ff922b' : a.grade === 'rare' ? '#3182f6' : a.grade === 'hidden' ? '#a25df5' : '#8b95a1',
                            fontWeight: 800
                          }}>
                            {a.grade.toUpperCase()}
                          </span>
                          {` • ${a.count}개`}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ gridColumn: 'span 2', textAlign: 'center', color: '#8b95a1', fontSize: '13px', padding: '40px 0' }}>획득한 부적이 아직 없습니다.</p>
                  )}
                </div>
              </Section>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto 12px' }}>
              <IoSearch style={{ position: 'absolute', left: '16px', top: '16px', color: '#adb5bd' }} size={20} />
              <input 
                style={{ width: '100%', boxSizing: 'border-box', padding: '16px 16px 16px 48px', borderRadius: '14px', border: '1px solid #e5e8eb', fontSize: '16px', fontWeight: 600, outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} 
                placeholder="유저 검색 (회원 ID 또는 Toss 식별 Key)" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} 
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {loading ? (
                <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px', color: '#8b95a1', fontWeight: 600 }}>데이터 로드 중...</p>
              ) : users.map((u: any) => (
                <div key={u.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', border: '1px solid #e5e8eb' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#191f28' }}>
                      ID: #{u.id} {u.isDeleted && <span style={{ color: '#f04452', fontSize: '11px', fontWeight: 700 }}>(탈퇴 회원)</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8b95a1', marginTop: '4px', fontFamily: 'monospace' }}>Key: {u.tossUserKey.substring(0, 16)}...</div>
                  </div>
                  <button 
                    onClick={() => handleSelectUser(u.id)} 
                    style={{ backgroundColor: '#3182f6', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(49, 130, 246, 0.1)' }}
                  >
                    상세 정보
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
