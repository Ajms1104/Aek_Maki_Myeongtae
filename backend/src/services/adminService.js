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

exports.getDashboardStats = async (range = '30d') => {
  // 1. 조회 기간 파라미터 매핑 (기본 30일)
  let daysLimit = 30;
  if (range === '7d') daysLimit = 7;
  else if (range === '90d') daysLimit = 90;
  else if (range === 'all') daysLimit = 365; // 인프라 과부하 방지용 최대 1년 캡

  const { rows: userStats } = await db.query('SELECT COUNT(*) AS count FROM users WHERE is_deleted = FALSE');
  const { rows: amuletStats } = await db.query('SELECT COUNT(*) AS count FROM user_amulets');
  const { rows: consultStats } = await db.query('SELECT COUNT(*) AS count FROM consultations');
  const { rows: todayUsers } = await db.query(
    'SELECT COUNT(*) AS count FROM users WHERE created_at >= DATE_TRUNC(\'day\', NOW() AT TIME ZONE \'Asia/Seoul\')'
  );
  
  // 부적 등급 분포 집계
  const { rows: gradeStats } = await db.query(
    'SELECT a.grade, COUNT(*) AS count FROM user_amulets ua JOIN amulets a ON ua.amulet_id = a.id GROUP BY a.grade'
  );
  const gradeDistribution = {};
  gradeStats.forEach(row => {
    gradeDistribution[row.grade] = parseInt(row.count);
  });

  // [체류 시간 보정] 동일인/일자별 첫 접속과 마지막 접속 로그 시간차 평균 계산
  const { rows: durationStats } = await db.query(`
    SELECT COALESCE(ROUND(AVG(duration)), 0) AS avg
    FROM (
      SELECT user_id, 
             EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) AS duration
      FROM user_access_logs
      WHERE created_at >= NOW() - INTERVAL '${daysLimit} days'
      GROUP BY user_id, DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')
      HAVING EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) > 0
         AND EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) < 3600
    ) sub
  `);


  // [DAU 지표] 최근 N일간 일별 활동 유저 수 (DAU)
  const { rows: dauStats } = await db.query(
    `SELECT DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::text AS date, COUNT(DISTINCT user_id) AS count 
     FROM user_access_logs 
     WHERE created_at >= NOW() - INTERVAL '${daysLimit} days'
     GROUP BY date 
     ORDER BY date DESC`
  );

  // [시계열 분석] 타임존 정정 및 누락 방지용 일별 종합 통계 추이 리포트
  const { rows: dailyTrends } = await db.query(
    `SELECT 
       d.date::text AS "date",
       COALESCE(u.new_users, 0)::int AS "newUsers",
       COALESCE(a.amulets_issued, 0)::int AS "amuletsIssued",
       COALESCE(c.consultations, 0)::int AS "consultations",
       COALESCE(dau.dau_count, 0)::int AS "dau"
     FROM (
       SELECT (DATE_TRUNC('day', NOW() AT TIME ZONE 'Asia/Seoul')::date - i)::date AS date 
       FROM generate_series(0, ${daysLimit - 1}) i
     ) d
     LEFT JOIN (
       SELECT DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul') AS date, COUNT(*) AS new_users 
       FROM users WHERE is_deleted = FALSE GROUP BY date
     ) u ON d.date = u.date
     LEFT JOIN (
       SELECT DATE(first_acquired_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul') AS date, SUM(count) AS amulets_issued 
       FROM user_amulets GROUP BY date
     ) a ON d.date = a.date
     LEFT JOIN (
       SELECT DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul') AS date, COUNT(*) AS consultations 
       FROM consultations GROUP BY date
     ) c ON d.date = c.date
     LEFT JOIN (
       SELECT DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul') AS date, COUNT(DISTINCT user_id) AS dau_count
       FROM user_access_logs GROUP BY date
     ) dau ON d.date = dau.date
     ORDER BY d.date ASC`
  );

  // 🔒 [APM 모니터링 수집 지표]
  // A. 느린 API 응답 랭킹 (Latency TOP 5)
  const { rows: slowApis } = await db.query(`
    SELECT method, path, ROUND(AVG(latency_ms))::int AS "avgLatency", COUNT(*)::int AS count 
    FROM system_performance_logs 
    WHERE created_at >= NOW() - INTERVAL '${daysLimit} days'
    GROUP BY method, path 
    ORDER BY "avgLatency" DESC 
    LIMIT 5
  `);

  // B. HTTP 상태코드 분포 비중
  const { rows: statusCodeStats } = await db.query(`
    SELECT status, COUNT(*)::int AS count 
    FROM system_performance_logs 
    WHERE created_at >= NOW() - INTERVAL '${daysLimit} days'
    GROUP BY status
  `);

  // C. 주요 DB 트랜잭션 병목 분석 (DB Query Latency TOP 5)
  const { rows: slowQueries } = await db.query(`
    SELECT method, path, ROUND(AVG(total_query_latency_ms))::int AS "avgDbLatency", ROUND(AVG(query_count))::int AS "avgQueryCount"
    FROM system_performance_logs 
    WHERE created_at >= NOW() - INTERVAL '${daysLimit} days' AND query_count > 0
    GROUP BY method, path 
    ORDER BY "avgDbLatency" DESC 
    LIMIT 5
  `);

  // 🔒 [유입 경로 & 결제 전환 지표]
  // A. 공유 링크 추천인 유입 랭킹 (Referrer TOP 5)
  const { rows: referrerStats } = await db.query(`
    SELECT referrer, COUNT(*)::int AS count 
    FROM user_access_logs 
    WHERE created_at >= NOW() - INTERVAL '${daysLimit} days' AND referrer IS NOT NULL AND action = 'APP_ENTER'
    GROUP BY referrer 
    ORDER BY count DESC 
    LIMIT 5
  `);

  // B. 행동 카테고리별 클릭 횟수 비중
  const { rows: actionStats } = await db.query(`
    SELECT action, COUNT(*)::int AS count 
    FROM user_access_logs 
    WHERE created_at >= NOW() - INTERVAL '${daysLimit} days'
    GROUP BY action 
    ORDER BY count DESC
  `);

  // C. 결제 깔때기(Funnel) 전환율 계산
  const { rows: rechargeEnterStats } = await db.query(
    `SELECT COUNT(*)::int AS count FROM user_access_logs WHERE action = 'RECHARGE_PAGE_ENTER' AND created_at >= NOW() - INTERVAL '${daysLimit} days'`
  );
  const { rows: paymentSuccessStats } = await db.query(
    `SELECT COUNT(*)::int AS count FROM user_access_logs WHERE action = 'PAYMENT_SUCCESS' AND created_at >= NOW() - INTERVAL '${daysLimit} days'`
  );
  const rechargePageClicks = rechargeEnterStats[0]?.count || 0;
  const paymentCompleted = paymentSuccessStats[0]?.count || 0;
  const conversionRate = rechargePageClicks > 0 ? parseFloat(((paymentCompleted / rechargePageClicks) * 100).toFixed(1)) : 0;

  // 🔒 [사용 시간대 및 요일 패턴 (usage_temporal_patterns)]
  // A. 요일별 트래픽 분포 (KST 기준)
  const { rows: dayOfWeekStats } = await db.query(`
    SELECT to_char(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'DY') AS day_name, COUNT(*)::int AS count 
    FROM user_access_logs 
    WHERE created_at >= NOW() - INTERVAL '${daysLimit} days'
    GROUP BY day_name
  `);

  // B. 24시간 시간대별 트래픽 분포 (KST 기준)
  const { rows: hourOfDayStats } = await db.query(`
    SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::int AS hour, COUNT(*)::int AS count 
    FROM user_access_logs 
    WHERE created_at >= NOW() - INTERVAL '${daysLimit} days'
    GROUP BY hour 
    ORDER BY hour
  `);

  // 🔒 [재방문 코호트 매트릭스 (Cohort Retention)] - CTE 기반 초정밀 쿼리
  const { rows: cohortStats } = await db.query(`
    WITH user_cohort AS (
      SELECT id AS user_id, 
             DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul') AS join_date
      FROM users
      WHERE is_deleted = FALSE AND created_at >= NOW() - INTERVAL '${daysLimit} days'
    ),
    user_activity AS (
      SELECT DISTINCT user_id, 
             DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul') AS activity_date
      FROM user_access_logs
      WHERE created_at >= NOW() - INTERVAL '${daysLimit} days'
    ),
    cohort_size AS (
      SELECT join_date, COUNT(*) AS cohort_users
      FROM user_cohort
      GROUP BY join_date
    )
    SELECT 
      uc.join_date::text AS "joinDate",
      cs.cohort_users AS "cohortSize",
      COALESCE(COUNT(DISTINCT CASE WHEN ua.activity_date = uc.join_date THEN ua.user_id END), 0)::int AS "d0",
      COALESCE(COUNT(DISTINCT CASE WHEN ua.activity_date = uc.join_date + 1 THEN ua.user_id END), 0)::int AS "d1",
      COALESCE(COUNT(DISTINCT CASE WHEN ua.activity_date = uc.join_date + 7 THEN ua.user_id END), 0)::int AS "d7",
      COALESCE(COUNT(DISTINCT CASE WHEN ua.activity_date = uc.join_date + 14 THEN ua.user_id END), 0)::int AS "d14",
      COALESCE(COUNT(DISTINCT CASE WHEN ua.activity_date = uc.join_date + 30 THEN ua.user_id END), 0)::int AS "d30"
    FROM user_cohort uc
    JOIN cohort_size cs ON uc.join_date = cs.join_date
    LEFT JOIN user_activity ua ON uc.user_id = ua.user_id
    GROUP BY uc.join_date, cs.cohort_users
    ORDER BY uc.join_date DESC
    LIMIT 10
  `);

  // 최근 15개 접속 로그
  const { rows: recentAccessLogs } = await db.query(
    `SELECT l.id, l.user_id AS "userId", u.toss_user_key AS "tossUserKey", l.action, l.duration_seconds AS "durationSeconds", l.created_at AS "createdAt"
     FROM user_access_logs l
     LEFT JOIN users u ON l.user_id = u.id
     ORDER BY l.created_at DESC
     LIMIT 15`
  );

  // 최근 15개 시스템 에러 로그
  const { rows: recentSystemLogs } = await db.query(
    `SELECT l.id, l.user_id AS "userId", u.toss_user_key AS "tossUserKey", l.level, l.message, l.data, l.created_at AS "createdAt"
     FROM system_logs l
     LEFT JOIN users u ON l.user_id = u.id
     ORDER BY l.created_at DESC
     LIMIT 15`
  );

  // 🔗 [공유 바이럴 전환율 지표]
  // 공유 시도 횟수
  const { rows: shareAttemptRows } = await db.query(
    `SELECT COUNT(*) AS count FROM user_access_logs
     WHERE action = 'SHARE_ATTEMPT' AND created_at >= NOW() - INTERVAL '${daysLimit} days'`
  );
  // 공유 링크(referrer)를 통해 신규 진입한 유저 수
  const { rows: referralUserRows } = await db.query(
    `SELECT COUNT(DISTINCT user_id) AS count FROM user_access_logs
     WHERE referrer IS NOT NULL AND referrer != '' AND created_at >= NOW() - INTERVAL '${daysLimit} days'`
  );
  // 공유 유입 유저 중 재방문율 (다음날 이후 재방문한 비율)
  const { rows: referralRetentionRows } = await db.query(
    `SELECT COALESCE(ROUND(
      100.0 * COUNT(DISTINCT r.user_id) / NULLIF(COUNT(DISTINCT f.user_id), 0)
    ), 0) AS rate
    FROM (
      SELECT DISTINCT user_id, DATE(created_at AT TIME ZONE 'Asia/Seoul') AS first_date
      FROM user_access_logs
      WHERE referrer IS NOT NULL AND referrer != ''
        AND created_at >= NOW() - INTERVAL '${daysLimit} days'
    ) f
    LEFT JOIN (
      SELECT DISTINCT l.user_id
      FROM user_access_logs l
      JOIN (
        SELECT DISTINCT user_id, MIN(DATE(created_at AT TIME ZONE 'Asia/Seoul')) AS first_date
        FROM user_access_logs WHERE referrer IS NOT NULL AND referrer != ''
        GROUP BY user_id
      ) fd ON l.user_id = fd.user_id
      WHERE DATE(l.created_at AT TIME ZONE 'Asia/Seoul') > fd.first_date
    ) r ON f.user_id = r.user_id`
  );

  return {
    totalUsers: parseInt(userStats[0].count),
    totalAmuletsIssued: parseInt(amuletStats[0].count),
    totalConsultations: parseInt(consultStats[0].count),
    todayNewUsers: parseInt(todayUsers[0].count),
    gradeDistribution,
    avgDurationSeconds: parseInt(durationStats[0].avg),
    dauStats: dauStats.map(row => ({ date: row.date, count: parseInt(row.count) })),
    dailyTrends, 
    recentAccessLogs,
    recentSystemLogs,
    // 신설 고도화 모니터링 지표 데이터
    slowApis,
    statusCodeStats,
    slowQueries,
    referrerStats,
    actionStats,
    paymentFunnel: {
      rechargePageClicks,
      paymentCompleted,
      conversionRate
    },
    temporalPatterns: {
      dayOfWeek: dayOfWeekStats,
      hourOfDay: hourOfDayStats
    },
    cohortStats,
    shareFunnelStats: {
      shareAttempt: parseInt(shareAttemptRows[0]?.count || 0),
      referralUsers: parseInt(referralUserRows[0]?.count || 0),
      referralRetention: parseInt(referralRetentionRows[0]?.rate || 0),
    }
  };
};
