require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
client.connect()
    .then(async () => {
        console.log("DB 연결 성공");
        // 컬럼 존재 여부 확인
        try {
            await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 1');
            console.log("DB 스키마 점검 완료: credits 컬럼 확인됨");
        } catch (err) {
            console.error("DB 스키마 업데이트 실패:", err.message);
        }
    })
    .catch((err => console.error("DB 연결 실패", err)));

module.exports = client;