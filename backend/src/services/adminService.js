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
  return {
    totalUsers: parseInt(userStats[0].count),
    totalAmuletsIssued: parseInt(amuletStats[0].count),
    totalConsultations: parseInt(consultStats[0].count),
    todayNewUsers: parseInt(todayUsers[0].count),
    gradeDistribution: {}
  };
};
