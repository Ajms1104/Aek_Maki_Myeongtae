//amulet = 부적 | 부적관련 Repository
const db = require('../db');

// 확률 조회
exports.getDraftWeights = async () => {
  const query = `
        SELECT 
            id AS "amuletId", 
            name, 
            grade, 
            weight,
            draft_weight AS "draftWeight" 
        FROM amulets 
        ORDER BY id ASC
    `;
  const result = await db.query(query);
  return result.rows;
};

// 확률 버전 정보 조회
exports.getProbabilityConfig = async () => {
  const query = 'SELECT version, updated_at AS "updatedAt" FROM probability_configs LIMIT 1';
  const result = await db.query(query);
  return result.rows[0];
};

// 드래프트 확률 업데이트
exports.updateWeight = async (id, weight) => {
  const query = `
        UPDATE amulets 
        SET draft_weight = $1 
        WHERE id = $2 
        RETURNING id AS "amuletId", name, grade, weight, draft_weight AS "draftWeight"
    `;
  const result = await db.query(query, [weight, id]);
  return result.rows[0];
};

// 확률 예약 저장
exports.createSchedule = async (version, weights, effectiveAt) => {
  const query = `
        INSERT INTO amulet_probability_schedules (version, weights, effective_at, status)
        VALUES ($1, $2, $3, 'PENDING')
        RETURNING id, version, effective_at AS "effectiveAt"
    `;
  const result = await db.query(query, [version, JSON.stringify(weights), effectiveAt]);
  return result.rows[0];
};

// 확률 일괄 적용 및 동기화
exports.applyWeights = async (version, weights) => {
  try {
    await db.query('BEGIN');

    // 1. 모든 부적의 weight와 draft_weight를 동기화
    for (const item of weights) {
      await db.query(
        'UPDATE amulets SET weight = $1, draft_weight = $1 WHERE id = $2',
        [item.weight, item.amuletId]
      );
    }

    // 2. 버전 정보 업데이트
    const updateConfigQuery = `
            UPDATE probability_configs 
            SET version = $1, 
                updated_at = CURRENT_TIMESTAMP
            RETURNING version, updated_at AS "effectiveAt"
        `;
    const result = await db.query(updateConfigQuery, [version]);

    await db.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
};

// 드래프트 덤프
exports.getDraftWeightsRows = async () => {
  const query = 'SELECT id AS "amuletId", draft_weight AS "weight" FROM amulets';
  const result = await db.query(query);
  return result.rows;
};

// 부적 생성
exports.create = async ({ name, description, grade, imageUrl }) => {
  const query = `
        INSERT INTO amulets (name, description, grade, image_url)
        VALUES ($1, $2, $3, $4)
        RETURNING id AS "amuletId", name, description, grade, image_url AS "imageUrl"
    `;
  const values = [name, description, grade, imageUrl];
  const result = await db.query(query, values);
  return result.rows[0];
};

// 부적 수정
exports.update = async (id, updateData) => {
  const fields = Object.keys(updateData);
  if (fields.length === 0) return this.findById(id);

  const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
  const values = Object.values(updateData);
  values.push(id);

  const query = `
        UPDATE amulets
        SET ${setClause}
        WHERE id = $${values.length}
        RETURNING id AS "amuletId", name, description, grade, image_url AS "imageUrl", weight
    `;

  const result = await db.query(query, values);
  return result.rows[0];
};

// 부적 삭제
exports.deleteById = async (id) => {
  const query = 'DELETE FROM amulets WHERE id = $1 RETURNING id';
  const result = await db.query(query, [id]);
  return result.rows.length > 0;
};

exports.findById = async (id) => {
  const query = 'SELECT id AS "amuletId", name, description, grade, image_url AS "imageUrl", weight FROM amulets WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

// amuletRepository.js 맨 아래에 추가

// 전체 부적 조회 (worryService용)
exports.getAll = async () => {
  const query = `
    SELECT id, name, grade, image_url AS "imageUrl", weight 
    FROM amulets 
    WHERE weight > 0
    ORDER BY id ASC
  `;
  const result = await db.query(query);
  return result.rows;
};

// 유저가 아직 얻지 못한 부적 목록 조회
exports.findUncollectedByUser = async (userId) => {
  const query = `
    SELECT id, name, grade, image_url AS "imageUrl", weight 
    FROM amulets 
    WHERE weight > 0 
      AND grade != 'hidden'
      AND id NOT IN (
        SELECT amulet_id FROM user_amulets WHERE user_id = $1
      )
    ORDER BY id ASC
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

// 유저가 해당 부적 보유 여부 확인
exports.checkUserHas = async (userId, amuletId) => {
  const query = `
    SELECT 1 FROM user_amulets 
    WHERE user_id = $1 AND amulet_id = $2
  `;
  const result = await db.query(query, [userId, amuletId]);
  return result.rows.length > 0;
};

// 유저에게 부적 지급
exports.giveToUser = async (userId, amuletId) => {
  const query = `
    INSERT INTO user_amulets (user_id, amulet_id, count)
    VALUES ($1, $2, 1)
    ON CONFLICT (user_id, amulet_id)
    DO UPDATE SET count = user_amulets.count + 1, updated_at = NOW()
  `;
  await db.query(query, [userId, amuletId]);
};

// 유저의 부적 소유권 확인 및 이미지 정보 조회
exports.findUserAmuletWithOwner = async (userId, userAmuletId) => {
  const query = `
        SELECT a.image_url, a.name
        FROM user_amulets ua
        JOIN amulets a ON ua.amulet_id = a.id
        WHERE ua.user_id = $1 AND ua.id = $2
    `;
  const result = await db.query(query, [userId, userAmuletId]);
  return result.rows[0];
};

// --- 관리자 전용 기능 추가 ---

// 유저의 보유 부적 목록 상세 조회
exports.findUserAmuletsByUserId = async (userId) => {
  const query = `
    SELECT 
        ua.id AS "userAmuletId",
        a.id AS "amuletId",
        a.name,
        a.grade,
        ua.count,
        ua.created_at AS "createdAt",
        ua.updated_at AS "updatedAt"
    FROM user_amulets ua
    JOIN amulets a ON ua.amulet_id = a.id
    WHERE ua.user_id = $1
    ORDER BY ua.created_at DESC
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

// 유저 보유 부적 삭제 (회수)
exports.removeUserAmulet = async (userAmuletId) => {
  const query = 'DELETE FROM user_amulets WHERE id = $1 RETURNING id';
  const result = await db.query(query, [userAmuletId]);
  return result.rows.length > 0;
};

// 전체 부적 카탈로그 (도감용)
exports.findAllCatalog = async () => {
  const { rows } = await db.query(
    `SELECT id, name, grade, image_url AS "imageUrl",
            silhouette_image_url AS "silhouetteImageUrl", description
     FROM amulets
     WHERE is_active = TRUE
     ORDER BY grade, name`
  );
  return rows;
};

// 유저 인벤토리 조회
exports.findUserInventory = async (userId) => {
  const { rows } = await db.query(
    `SELECT ua.amulet_id AS "amuletId", ua.count,
            ua.first_acquired_at AS "firstAcquiredAt",
            a.name, a.grade, a.image_url AS "imageUrl"
     FROM user_amulets ua
     JOIN amulets a ON a.id = ua.amulet_id
     WHERE ua.user_id = $1
     ORDER BY ua.first_acquired_at DESC`,
    [userId]
  );
  return rows;
};

// 카탈로그 + 보유 조합 (도감 조회용)
exports.findCollection = async (userId) => {
  const { rows } = await db.query(
    `SELECT a.id, a.name, a.grade,
            a.image_url AS "imageUrl",
            a.silhouette_image_url AS "silhouetteImageUrl",
            a.description,
            CASE 
              WHEN a.grade = 'hidden' THEN false
              WHEN ua.amulet_id IS NOT NULL THEN false 
              ELSE true 
            END AS "isLocked",
            CASE
              WHEN a.grade = 'hidden' THEN COALESCE(ua.count, 1)
              ELSE COALESCE(ua.count, 0)
            END AS count
     FROM amulets a
     LEFT JOIN user_amulets ua ON ua.amulet_id = a.id AND ua.user_id = $1
     LEFT JOIN users u ON u.id = $1
     WHERE (a.grade != 'hidden' AND a.is_active = TRUE)
        OR (a.grade = 'hidden' AND u.has_hidden_pass = TRUE)
     ORDER BY 
       CASE a.grade 
         WHEN 'hidden' THEN 1
         WHEN 'legend' THEN 2 
         WHEN 'rare' THEN 3 
         WHEN 'common' THEN 4 
         ELSE 5 
       END, a.name`,
    [userId]
  );
  return rows;
};

// 유저 부적 단건 조회 (다운로드용) - amulet_id 기준
exports.findUserAmulet = async (userId, amuletId) => {
  const { rows } = await db.query(
    `SELECT ua.amulet_id AS "amuletId", ua.count,
            a.name, a.grade, a.image_url AS "imageUrl"
     FROM user_amulets ua
     JOIN amulets a ON a.id = ua.amulet_id
     WHERE ua.user_id = $1 AND ua.amulet_id = $2`,
    [userId, amuletId]
  );
  return rows[0] || null;
};

// 다운로드 이력 저장
exports.saveDownload = async (userId, amuletId) => {
  await db.query(
    `INSERT INTO amulet_downloads (user_id, amulet_id) VALUES ($1, $2)`,
    [userId, amuletId]
  );
};