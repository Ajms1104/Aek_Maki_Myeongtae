'use strict';

const express = require('express');
const router = express.Router();

// 프론트엔드에서 보내는 원격 로그 수신
router.post('/log', (req, res) => {
  const { level, message, data } = req.body;
  const timestamp = new Date().toISOString();
  
  const prefix = `[REMOTE-${level?.toUpperCase() || 'INFO'}]`;
  console.log(`${timestamp} ${prefix} ${message}`, data ? JSON.stringify(data, null, 2) : '');
  
  res.status(204).end();
});

module.exports = router;
