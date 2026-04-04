'use strict';

const amuletService = require('../services/amuletService');

// 부적 도감 마스터 조회
exports.getCatalog = async (req, res) => {
  try {
    const result = await amuletService.getCatalog();
    return res.status(200).json(result);
  } catch (err) {
    console.error('getCatalog 에러:', err);
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};

// 내 보유 부적 조회
exports.getMyAmulets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await amuletService.getMyAmulets(userId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('getMyAmulets 에러:', err);
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};

// 유저 부적 도감 조회
exports.getCollection = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await amuletService.getCollection(userId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('getCollection 에러:', err);
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};

// 내 부적 다운로드
exports.downloadAmulet = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { userAmuletId } = req.params;

    const { imagePath, name } = await amuletService.downloadAmulet(
      userId,
      userAmuletId
    );

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(name)}.png"`);
    res.setHeader('Content-Type', 'image/png');
    return res.sendFile(imagePath);
  } catch (err) {
    console.error('downloadAmulet 에러:', err);
    if (err.status === 404) return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};