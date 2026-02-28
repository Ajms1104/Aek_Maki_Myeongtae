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
    .then(() => console.log("DB 연결 성공"))
    .catch((err => console.error("DB 연결 실패", err)));

module.exports = client;