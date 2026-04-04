'use strict';

const meService = require('../services/meService');

// 내 데이터 전체 삭제
exports.deleteMyData = async (req, res) => {
  try {
    const userId = req.user.userId;
    await meService.deleteMyData(userId);
    return res.status(200).json({ message: '모든 데이터가 삭제되었습니다.' });
  } catch (err) {
    console.error('deleteMyData 에러:', err);
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};

// 토스 UNLINK 콜백 수신
exports.unlinkCallback = async (req, res) => {
  try {
    // GET, POST 둘 다 지원 (앱인토스 정책)
    const tossUserKey =
      req.query.userKey || req.body.userKey;
    const referrer =
      req.query.referrer || req.body.referrer;

    if (!tossUserKey) {
      return res.status(400).json({ error: 'userKey가 없습니다.' });
    }

    await meService.handleUnlink(tossUserKey, referrer);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('unlinkCallback 에러:', err);
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};