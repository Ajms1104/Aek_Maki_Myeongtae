const db = require('../db');
const amuletRepository = require('../repositories/amuletRepository');
const userRepository = require('../repositories/userRepository');

// 관리자 - 확률 조회
exports.getProbabilities = async () => {
  const config = await amuletRepository.getProbabilityConfig();
  const items = await amuletRepository.getDraftWeights();

  return {
    version: config.version,
    updatedAt: config.updatedAt,
    items
  };
};

// 관리자 - 드래프트 확률 업데이트
exports.updateProbability = async (id, weight) => {
  const updatedAmulet = await amuletRepository.updateWeight(id, weight);
  if (!updatedAmulet) {
    throw new Error('NOT_FOUND');
  }

  return {
    message: '부적 드래프트 확률이 수정되었습니다. 최종 적용을 위해 발행을 진행해주세요.',
    updatedAmulet
  };
};

// 관리자 - 확률 실제 적용
exports.publishProbabilities = async ({ effectiveAt }) => {
  const config = await amuletRepository.getProbabilityConfig();
  const nextVersion = config.version + 1;
  const weights = await amuletRepository.getDraftWeightsRows();

  // 예약인 경우
  if (effectiveAt && new Date(effectiveAt) > new Date()) {
    const schedule = await amuletRepository.createSchedule(nextVersion, weights, effectiveAt);
    return {
      message: '확률 발행이 예약되었습니다.',
      publishedVersion: schedule.version,
      effectiveAt: schedule.effectiveAt,
      status: 'SCHEDULED'
    };
  }

  // 즉시 적용
  const result = await amuletRepository.applyWeights(nextVersion, weights);
  return {
    message: '확률이 즉시 적용되었습니다.',
    publishedVersion: result.version,
    effectiveAt: result.effectiveAt,
    status: 'PUBLISHED'
  };
};

// 관리자 - 부적 생성
exports.createAmulet = async ({ name, description, grade, file }) => {
  const imageUrl = `/uploads/${file.filename}`;
  const newAmulet = await amuletRepository.create({ name, description, grade, imageUrl });
  return newAmulet;
};

// 관리자 - 부적 수정
exports.updateAmulet = async (id, { name, description, grade, file }) => {
  const updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (grade) updateData.grade = grade;
  if (file) updateData.image_url = `/uploads/${file.filename}`;

  const updatedAmulet = await amuletRepository.update(id, updateData);
  if (!updatedAmulet) {
    throw new Error('NOT_FOUND');
  }
  return updatedAmulet;
};

// 관리자 - 부적 삭제
exports.deleteAmulet = async (id) => {
  const deleted = await amuletRepository.deleteById(id);
  if (!deleted) {
    throw new Error('NOT_FOUND');
  }
  return true;
};

// 관리자 - 전체 유저 리스트 조회
exports.getUsers = async ({ search, limit, offset }) => {
  const { rows } = await db.query(
    `SELECT id, toss_user_key AS "tossUserKey", created_at AS "createdAt",
            last_seen_at AS "lastSeenAt", is_deleted AS "isDeleted",
            COUNT(*) OVER() AS total_count
     FROM users
     WHERE is_deleted = FALSE
       AND ($1 = '' OR id::text LIKE $1 OR toss_user_key::text LIKE $1)
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [search ? `%${search}%` : '', limit, offset]
  );

  const totalCount = rows.length > 0 ? parseInt(rows[0].total_count) : 0;
  return {
    users: rows.map(({ total_count, ...rest }) => rest),
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Math.floor(offset / limit) + 1,
    },
  };
};

// 관리자 - 유저 크레딧 수정
exports.updateUserCredit = async (userId, credits) => {
  const updatedCredits = await userRepository.updateCredit(userId, credits);
  if (updatedCredits === null) {
    throw new Error('NOT_FOUND');
  }
  return { userId, credits: updatedCredits };
};

// 관리자 - 유저 상세 조회
exports.getUserDetail = async (userId) => {
  const { rows } = await db.query(
    `SELECT id, toss_user_key AS "tossUserKey", credits AS "credit",
            created_at AS "createdAt", last_seen_at AS "lastSeenAt",
            is_deleted AS "isDeleted"
     FROM users WHERE id = $1`,
    [userId]
  );
  if (!rows[0]) return null;

  const user = rows[0];

  // 상담 수
  const { rows: consultRows } = await db.query(
    'SELECT COUNT(*) AS count FROM consultations WHERE user_id = $1',
    [userId]
  );

  // 보유 부적 수
  const { rows: amuletRows } = await db.query(
    'SELECT COUNT(*) AS count FROM user_amulets WHERE user_id = $1',
    [userId]
  );

  return {
    ...user,
    consultationCount: parseInt(consultRows[0].count),
    amuletCount: parseInt(amuletRows[0].count),
  };
};

// 관리자 - 문의 리스트 조회
exports.getSupportTickets = async ({ status, cursor, limit }) => {
  const lastId = cursor ? parseInt(cursor) : 99999999;
  const { rows } = await db.query(
    `SELECT id AS "ticketId", user_id AS "userId", title, status,
            created_at AS "createdAt"
     FROM support
     WHERE ($1 = 'ALL' OR status = $1) AND id < $2
     ORDER BY id DESC LIMIT $3`,
    [status, lastId, limit]
  );

  return {
    items: rows,
    nextCursor: rows.length > 0 ? rows[rows.length - 1].ticketId : null,
  };
};

// 관리자 - 문의 상태 변경/답변 등록
exports.updateSupportTicket = async ({ ticketId, status, replyContent }) => {
  let finalStatus = status;
  if (replyContent && !status) finalStatus = 'Done';

  const { rows } = await db.query(
    `UPDATE support
     SET status = COALESCE($1, status),
         reply_content = COALESCE($2, reply_content),
         updated_at = NOW()
     WHERE id = $3
     RETURNING id AS "ticketId", status,
               reply_content AS "replyContent",
               updated_at AS "updatedAt"`,
    [finalStatus, replyContent, ticketId]
  );
  return rows[0] || null;
};

// 유저의 보유 부적 조회
exports.getUserAmulets = async (userId) => {
  return await amuletRepository.findUserAmuletsByUserId(userId);
};

// 유저에게 부적 지급
exports.giveAmuletToUser = async (userId, amuletId) => {
  await amuletRepository.giveToUser(userId, amuletId);
  return { success: true };
};

// 유저 보유 부적 회수
exports.revokeUserAmulet = async (userAmuletId) => {
  const deleted = await amuletRepository.removeUserAmulet(userAmuletId);
  if (!deleted) {
    const error = new Error('회수할 부적 내역을 찾을 수 없습니다.');
    error.status = 404;
    throw error;
  }
  return { success: true };
};