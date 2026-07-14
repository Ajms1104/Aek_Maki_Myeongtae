'use strict';

const express = require('express');
const router = express.Router();

const db = require('../db');
const jwt = require('jsonwebtoken');

// 프론트엔드에서 보내는 원격 로그 수신
router.post('/log', async (req, res) => {
  const { level, message, data } = req.body;
  const timestamp = new Date().toISOString();
  
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {
      // 토큰 검증 에러 시 userId는 null로 유지
    }
  }
  
  const prefix = `[REMOTE-${level?.toUpperCase() || 'INFO'}]`;
  console.log(`${timestamp} ${prefix} ${message}`, data ? JSON.stringify(data, null, 2) : '');
  
  try {
    await db.query(
      'INSERT INTO system_logs (user_id, level, message, data) VALUES ($1, $2, $3, $4)',
      [userId, level?.toUpperCase() || 'INFO', message, data ? JSON.stringify(data) : null]
    );
  } catch (err) {
    console.error('[RemoteLog DB Save Fail]', err.message);
  }
  
  res.status(204).end();
});

module.exports = router;
