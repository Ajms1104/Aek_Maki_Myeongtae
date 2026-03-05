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

exports.getAllWeights = async () => {
  const query = `
    SELECT id, name, grade, weight 
    FROM amulets 
    ORDER BY id ASC
  `;
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
