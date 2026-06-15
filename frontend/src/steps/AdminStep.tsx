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
    <S.StepContainer style={{ backgroundColor: '#f2f4f6', padding: 0, width: '100%', maxWidth: '480px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '56px 24px 12px', backgroundColor: '#fff', borderBottom: '1px solid #e5e8eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(selectedUser || showStats) && <IoArrowBack size={24} onClick={() => { setSelectedUser(null); setShowStats(false); }} style={{ cursor: 'pointer' }} />}
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
              {selectedUser ? `유저 상세 (#${selectedUser.id})` : showStats ? '서비스 통계' : '운영 관리 도구'}
            </h1>
          </div>
          {!selectedUser && !showStats && (
            <IoStatsChartOutline size={24} color="#3182f6" onClick={() => setShowStats(true)} style={{ cursor: 'pointer' }} />
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '40px' }}>
        {showStats && stats ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <StatCard icon={<IoPeopleOutline color="#3182f6" />} label="전체 유저" value={stats.totalUsers} />
              <StatCard icon={<IoSparklesOutline color="#ff922b" />} label="발급된 부적" value={stats.totalAmuletsIssued} />
              <StatCard icon={<IoTicketOutline color="#2ecc71" />} label="전체 상담" value={stats.totalConsultations} />
              <StatCard icon={<IoPeopleOutline color="#3182f6" />} label="오늘 신규" value={stats.todayNewUsers} />
            </div>
            <Section title="부적 등급 분포">
              {Object.entries(stats.gradeDistribution || {}).map(([grade, count]: any) => (
                <div key={grade} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, textTransform: 'capitalize' }}>{grade}</span>
                  <span style={{ fontSize: '14px', color: '#3182f6', fontWeight: 700 }}>{count}개</span>
                </div>
              ))}
            </Section>
          </div>
        ) : selectedUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', border: '2px solid #e8f3ff' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#191f28', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IoCheckmarkCircleOutline color="#3182f6" size={20} />
                히든 부적 해금 상태: {selectedUser.hasHiddenPass ? '해금됨' : '잠금'}
              </div>
              {!selectedUser.hasHiddenPass && (
                <C.Button onClick={handleManualUnlock} $variant="primary" style={{ backgroundColor: '#3182f6', height: '48px', width: '100%' }}>
                  히든 부적 강제 해금하기
                </C.Button>
              )}
            </div>
            <Section title="크레딧 관리">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#8b95a1', marginBottom: '4px' }}>현재 크레딧</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#191f28' }}>{selectedUser.credit}</div>
                </div>
                <div style={{ flex: 1.5, display: 'flex', gap: '8px' }}>
                  <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e8eb', fontSize: '15px', outline: 'none' }} value={editCredit} onChange={(e) => setEditCredit(e.target.value)} />
                  <button onClick={handleUpdateCredit} style={{ padding: '0 12px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>수정</button>
                </div>
              </div>
            </Section>
            <Section title="유저 기본 정보">
              <DataRow label="ID" value={selectedUser.id} />
              <DataRow label="Toss Key" value={selectedUser.tossUserKey.substring(0, 20) + '...'} />
              <DataRow label="상담 횟수" value={`${selectedUser.consultationCount}회`} />
              <DataRow label="가입일" value={new Date(selectedUser.createdAt).toLocaleDateString()} />
            </Section>
            <Section title={`보유 부적 (${selectedUser.amuletCount}개)`}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {selectedUser.amulets?.length > 0 ? (
                  selectedUser.amulets.map((a: any) => (
                    <div key={a.userAmuletId} style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #f2f4f6' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#333d4b', marginBottom: '4px' }}>{a.name}</div>
                      <div style={{ fontSize: '11px', color: '#8b95a1', fontWeight: 600 }}>
                        <span style={{ color: a.grade === 'legend' ? '#ff922b' : a.grade === 'rare' ? '#3182f6' : '#8b95a1' }}>{a.grade.toUpperCase()}</span>
                        {` • ${a.count}개`}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ gridColumn: 'span 2', textAlign: 'center', color: '#8b95a1', fontSize: '13px', padding: '20px 0' }}>보유한 부적이 없습니다.</p>
                )}
              </div>
            </Section>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <IoSearch style={{ position: 'absolute', left: '12px', top: '14px', color: '#adb5bd' }} size={20} />
              <input style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '12px', border: 'none', fontSize: '15px', outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} placeholder="유저 검색 (ID 또는 Toss Key)" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} />
            </div>
            {loading ? <p style={{ textAlign: 'center', padding: '40px', color: '#8b95a1' }}>불러오는 중...</p> : users.map((u: any) => (
              <div key={u.id} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>ID: {u.id} {u.isDeleted && <span style={{ color: '#f04452', fontSize: '11px' }}>(탈퇴)</span>}</div>
                  <div style={{ fontSize: '12px', color: '#8b95a1' }}>Key: {u.tossUserKey.substring(0, 15)}...</div>
                </div>
                <button onClick={() => handleSelectUser(u.id)} style={{ backgroundColor: '#3182f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>상세보기</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </S.StepContainer>
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
