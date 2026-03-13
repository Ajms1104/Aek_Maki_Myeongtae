'use strict';

const authService = require('../services/authService');

exports.tossExchange = async (req, res) => {
  try {
    const { authorizationCode, referrer } = req.body;

    if (!authorizationCode || !referrer) {
      return res.status(400).json({ 
        error: 'authorizationCode와 referrer는 필수입니다.' 
      });
    }

    const result = await authService.exchangeAndIssueToken(
      authorizationCode, 
      referrer
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error('tossExchange 에러:', err);
    if (err.status === 400) return res.status(400).json({ error: err.message });
    return res.status(502).json({ error: '토스 API 호출에 실패했습니다.' });
  }
};