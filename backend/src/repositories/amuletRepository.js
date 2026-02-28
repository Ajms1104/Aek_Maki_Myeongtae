const db = require('../db');

// 부적 확률 업데이트
exports.updateWeight = async (id, weight) => {
    const query = `
    UPDATE amulets 
    SET weight = $1 
    WHERE id = $2 
    RETURNING id, name, grade, weight
  `;
    const result = await db.query(query, [weight, id]);
    return result.rows[0];
};

// 전체 부적 확률 정보 조회
exports.getAllWeights = async () => {
    const query = `
    SELECT id, name, grade, weight 
    FROM amulets 
    ORDER BY id ASC
  `;
    const result = await db.query(query);
    return result.rows;
};
