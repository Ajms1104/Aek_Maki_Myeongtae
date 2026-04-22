import React, { useState, useEffect } from 'react';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import { getAdminUsers, getAdminUserDetail, updateAdminUserUnlock } from '../utils/api';
import { 
  IoArrowBack, IoSearch, IoCheckmarkCircleOutline 
} from 'react-icons/io5';

export default function AdminStep() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editCredit, setEditCredit] = useState('');

  useEffect(() => {
    if (!selectedUser) fetchUsers();
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers(1, search);
      setUsers(data.users || []);
    } catch (err) {
      setUsers([
        { id: 1, tossUserKey: '82910001', credit: 5, createdAt: '2024-03-20' },
        { id: 2, tossUserKey: '11020002', credit: 12, createdAt: '2024-03-21' },
      ]);
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
      setSelectedUser({
        id: userId,
        tossUserKey: '82910001',
        credit: 5,
        createdAt: '2024-03-20 10:00:00',
        lastSeenAt: '2024-03-21 15:30:00',
        amulets: [
          { id: 1, name: '윙크 명태', grade: 'common', count: 2 }
        ]
      });
      setEditCredit('5');
    }
  };

  const handleUpdateCredit = () => {
    alert(`유저 #${selectedUser.id}의 크레딧을 ${editCredit}으로 변경합니다.`);
    setSelectedUser({ ...selectedUser, credit: parseInt(editCredit) });
  };

  const handleManualUnlock = async () => {
    if (!selectedUser) return;
    if (!confirm('결제 오류 해결을 위해 이 유저의 히든 부적을 강제로 해금할까요?')) return;
    try {
      await updateAdminUserUnlock(selectedUser.id, true);
      alert('해금이 완료되었습니다.');
    } catch (err) {
      alert('백엔드 API 미연결 상태입니다.');
    }
  };

  return (
    <S.StepContainer style={{ backgroundColor: '#f2f4f6', padding: 0, width: '100%', maxWidth: '480px', margin: '0 auto' }}>
      {/* 헤더 영역 */}
      <div style={{ padding: '56px 24px 12px', backgroundColor: '#fff', borderBottom: '1px solid #e5e8eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedUser && <IoArrowBack size={24} onClick={() => setSelectedUser(null)} style={{ cursor: 'pointer' }} />}
          <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
            {selectedUser ? `유저 상세 (#${selectedUser.id})` : '운영 관리 도구'}
          </h1>
        </div>
      </div>

      {/* 본문 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', paddingBottom: '100px' }}>
        {selectedUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* 해금 버튼 */}
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', border: '2px solid #e8f3ff' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#191f28', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IoCheckmarkCircleOutline color="#3182f6" size={20} />
                결제 오류 수동 복구
              </div>
              <C.Button onClick={handleManualUnlock} $variant="primary" style={{ backgroundColor: '#3182f6', height: '48px', width: '100%' }}>
                히든 부적 강제 해금하기
              </C.Button>
            </div>

            {/* 크레딧 관리 */}
            <Section title="크레딧(상담 가능 횟수) 관리">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#8b95a1', marginBottom: '4px' }}>현재 크레딧</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#191f28' }}>{selectedUser.credit}</div>
                </div>
                <div style={{ flex: 1.5, display: 'flex', gap: '8px' }}>
                  <input 
                    type="number"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e8eb', fontSize: '15px', outline: 'none' }}
                    value={editCredit}
                    onChange={(e) => setEditCredit(e.target.value)}
                  />
                  <button 
                    onClick={handleUpdateCredit}
                    style={{ padding: '0 12px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    수정
                  </button>
                </div>
              </div>
            </Section>

            <Section title="유저 기본 정보">
              <DataRow label="ID" value={selectedUser.id} />
              <DataRow label="Toss Key" value={selectedUser.tossUserKey} />
              <DataRow label="가입일" value={selectedUser.createdAt} />
              <DataRow label="마지막 활동" value={selectedUser.lastSeenAt} />
            </Section>

            <Section title="보유 부적">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {selectedUser.amulets?.map((a: any) => (
                  <div key={a.id} style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center', border: '1px solid #f2f4f6' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{a.name}</div>
                    <div style={{ fontSize: '11px', color: '#8b95a1' }}>{a.grade} ({a.count}개)</div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <IoSearch style={{ position: 'absolute', left: '12px', top: '14px', color: '#adb5bd' }} size={20} />
              <input 
                style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '12px', border: 'none', fontSize: '15px', outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                placeholder="유저 검색 (Toss Key)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              />
            </div>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#8b95a1' }}>불러오는 중...</p>
            ) : (
              users.map((u: any) => (
                <div key={u.id} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>ID: {u.id}</div>
                    <div style={{ fontSize: '12px', color: '#8b95a1' }}>Key: {u.tossUserKey}</div>
                  </div>
                  <button 
                    onClick={() => handleSelectUser(u.id)}
                    style={{ backgroundColor: '#3182f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    상세보기
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </S.StepContainer>
  );
}

function Section({ title, children }: any) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 12px 0', color: '#191f28' }}>{title}</h3>
      {children}
    </div>
  );
}

function DataRow({ label, value }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
      <span style={{ fontSize: '13px', color: '#8b95a1' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1b1c1d' }}>{value}</span>
    </div>
  );
}
