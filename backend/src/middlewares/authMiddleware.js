'use strict';

const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증 토큰이 없습니다.' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ 실제 DB에 유저가 있는지, 삭제된 유저는 아닌지 확인
    const user = await userRepository.findById(payload.userId);
    if (!user || user.is_deleted) {
      console.warn(`[Auth] 유효하지 않은 세션 접근 시도: userId=${payload.userId}`);
      return res.status(401).json({ error: '유효하지 않은 세션입니다. 다시 로그인해주세요.' });
    }

    req.user = { userId: payload.userId };
    return next();
  } catch (err) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = authMiddleware;