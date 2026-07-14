const db = require('../db');
const amuletRepository = require('../repositories/amuletRepository');
const userRepository = require('../repositories/userRepository');

exports.getProbabilities = async () => {
  const config = await amuletRepository.getProbabilityConfig();
  const items = await amuletRepository.getDraftWeights();
  return { version: config ? config.version : 0, updatedAt: config ? config.updatedAt : null, items };
};

exports.updateProbability = async (id, weight) => {
  const updatedAmulet = await amuletRepository.updateWeight(id, weight);
  if (!updatedAmulet) throw new Error('NOT_FOUND');
  return { message: '수정되었습니다.', updatedAmulet };
};

exports.publishProbabilities = async ({ effectiveAt }) => {
  const config = await amuletRepository.getProbabilityConfig();
  const nextVersion = (config ? config.version : 0) + 1;
  const weights = await amuletRepository.getDraftWeightsRows();
  const result = await amuletRepository.applyWeights(nextVersion, weights);
  return { message: '즉시 적용되었습니다.', publishedVersion: result.version, effectiveAt: result.effectiveAt, status: 'PUBLISHED' };
};

exports.getUsers = async ({ search, limit, offset }) => {
  const { rows } = await db.query(
    `SELECT id, toss_user_key AS "tossUserKey", created_at AS "createdAt", 
            last_seen_at AS "lastSeenAt", is_deleted AS "isDeleted"
     FROM users 
     WHERE ($1 = '' OR toss_user_key LIKE $1 OR id::text = $1)
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [search ? `%${search}%` : '', limit, offset]
  );
  const { rows: countRows } = await db.query('SELECT COUNT(*) FROM users WHERE is_deleted = FALSE');
  const totalCount = parseInt(countRows[0].count);
  return { users: rows, pagination: { totalCount, totalPages: Math.ceil(totalCount / limit), currentPage: Math.floor(offset / limit) + 1 } };
};

exports.getUserDetail = async (userId) => {
  const { rows } = await db.query(
    `SELECT id, toss_user_key AS "tossUserKey", credits AS "credit", has_hidden_pass AS "hasHiddenPass",
            created_at AS "createdAt", last_seen_at AS "lastSeenAt" FROM users WHERE id = $1`, [userId]
  );
  if (!rows[0]) return null;
  const { rows: consultRows } = await db.query('SELECT COUNT(*) FROM consultations WHERE user_id = $1', [userId]);
  const amulets = await amuletRepository.findUserAmuletsByUserId(userId);
  return { ...rows[0], consultationCount: parseInt(consultRows[0].count), amuletCount: amulets.length, amulets };
};

exports.updateUserUnlock = async (userId, unlocked) => {
  await db.query('UPDATE users SET has_hidden_pass = $1 WHERE id = $2', [unlocked, userId]);
  return { success: true };
};

exports.updateUserCredit = async (userId, credits) => {
  await db.query('UPDATE users SET credits = $1 WHERE id = $2', [credits, userId]);
  return { userId, credits };
};

exports.getDashboardStats = async () => {
  const { rows: userStats } = await db.query('SELECT COUNT(*) AS count FROM users WHERE is_deleted = FALSE');
  const { rows: amuletStats } = await db.query('SELECT COUNT(*) AS count FROM user_amulets');
  const { rows: consultStats } = await db.query('SELECT COUNT(*) AS count FROM consultations');
  const { rows: todayUsers } = await db.query('SELECT COUNT(*) AS count FROM users WHERE created_at >= CURRENT_DATE');
  
  // 부적 등급 분포 집계
  const { rows: gradeStats } = await db.query(
    'SELECT a.grade, COUNT(*) AS count FROM user_amulets ua JOIN amulets a ON ua.amulet_id = a.id GROUP BY a.grade'
  );
  const gradeDistribution = {};
  gradeStats.forEach(row => {
    gradeDistribution[row.grade] = parseInt(row.count);
  });

  // 🐟 [체류 시간 보정] 이탈 로그(APP_LEAVE)가 유실되어도 동일인/일자별 첫 접속과 마지막 접속 로그 시간차를 토대로 실질 체류 시간 계산
  const { rows: durationStats } = await db.query(`
    SELECT COALESCE(ROUND(AVG(duration)), 0) AS avg
    FROM (
      SELECT user_id, 
             EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) AS duration
      FROM user_access_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY user_id, to_char(created_at, 'YYYY-MM-DD')
      HAVING EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) > 0
    ) sub
  `);

  // 최근 7일간 일별 활동 유저 수 (DAU)
  const { rows: dauStats } = await db.query(
    `SELECT to_char(created_at, 'YYYY-MM-DD') AS date, COUNT(DISTINCT user_id) AS count 
     FROM user_access_logs 
     WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
     GROUP BY date 
     ORDER BY date DESC`
  );

  // 📈 [과거 기록 복구] 최근 30일간의 가입자수, 부적발행수, 상담수, DAU 일일 추이 통계 수집
  const { rows: dailyTrends } = await db.query(
    `SELECT 
       d.date::text AS "date",
       COALESCE(u.new_users, 0)::int AS "newUsers",
       COALESCE(a.amulets_issued, 0)::int AS "amuletsIssued",
       COALESCE(c.consultations, 0)::int AS "consultations",
       COALESCE(dau.dau_count, 0)::int AS "dau"
     FROM (
       SELECT (CURRENT_DATE - i)::date AS date 
       FROM generate_series(0, 29) i
     ) d
     LEFT JOIN (
       SELECT created_at::date AS date, COUNT(*) AS new_users 
       FROM users WHERE is_deleted = FALSE GROUP BY date
     ) u ON d.date = u.date
     LEFT JOIN (
       SELECT first_acquired_at::date AS date, SUM(count) AS amulets_issued 
       FROM user_amulets GROUP BY date
     ) a ON d.date = a.date
     LEFT JOIN (
       SELECT created_at::date AS date, COUNT(*) AS consultations 
       FROM consultations GROUP BY date
     ) c ON d.date = c.date
     LEFT JOIN (
       SELECT created_at::date AS date, COUNT(DISTINCT user_id) AS dau_count
       FROM user_access_logs GROUP BY date
     ) dau ON d.date = dau.date
     ORDER BY d.date ASC`
  );

  // 최근 15개 접속 로그
  const { rows: recentAccessLogs } = await db.query(
    `SELECT l.id, l.user_id AS "userId", u.toss_user_key AS "tossUserKey", l.action, l.duration_seconds AS "durationSeconds", l.created_at AS "createdAt"
     FROM user_access_logs l
     LEFT JOIN users u ON l.user_id = u.id
     ORDER BY l.created_at DESC
     LIMIT 15`
  );

  // 최근 15개 시스템 에러 로그 (단순 오류 파악용)
  const { rows: recentSystemLogs } = await db.query(
    `SELECT l.id, l.user_id AS "userId", u.toss_user_key AS "tossUserKey", l.level, l.message, l.data, l.created_at AS "createdAt"
     FROM system_logs l
     LEFT JOIN users u ON l.user_id = u.id
     ORDER BY l.created_at DESC
     LIMIT 15`
  );

  return {
    totalUsers: parseInt(userStats[0].count),
    totalAmuletsIssued: parseInt(amuletStats[0].count),
    totalConsultations: parseInt(consultStats[0].count),
    todayNewUsers: parseInt(todayUsers[0].count),
    gradeDistribution,
    avgDurationSeconds: parseInt(durationStats[0].avg),
    dauStats: dauStats.map(row => ({ date: row.date, count: parseInt(row.count) })),
    dailyTrends, // 관리자 페이지에서 과거 통계 추이를 확인할 수 있는 핵심 정보 전달
    recentAccessLogs,
    recentSystemLogs
  };
};
