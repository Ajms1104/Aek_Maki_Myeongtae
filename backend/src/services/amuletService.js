'use strict';

const amuletRepository = require('../repositories/amuletRepository');
const userRepository = require('../repositories/userRepository');
const path = require('path');
const fs = require('fs');

// 부적 도감 마스터 조회 (인증 불필요)
exports.getCatalog = async () => {
  const amulets = await amuletRepository.findAllCatalog();
  return {
    totalCount: amulets.length,
    amulets,
  };
};

// 내 보유 부적 조회
exports.getMyAmulets = async (userId) => {
  const owned = await amuletRepository.findUserInventory(userId);
  return { owned };
};

// 유저 부적 도감 조회 (카탈로그 + 보유 조합)
exports.getCollection = async (userId) => {
  const items = await amuletRepository.findCollection(userId);
  const user = await userRepository.findById(userId);

  const totalCount = items.length;
  const ownedCount = items.filter((i) => !i.isLocked).length;
  const collectionRate =
    totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  return { 
    collectionRate, 
    totalCount, 
    ownedCount, 
    credits: user ? user.credits : 0, // 크레딧 추가
    hasHiddenPass: user ? user.has_hidden_pass : false,
    lastAdWatchedAt: user ? user.last_ad_watched_at : null,
    items 
  };
};

// 내 부적 다운로드
exports.downloadAmulet = async (userId, userAmuletId) => {
  // 보유 여부 확인
  const userAmulet = await amuletRepository.findUserAmulet(userId, userAmuletId);
  if (!userAmulet) {
    const err = new Error('보유하지 않은 부적입니다.');
    err.status = 404;
    throw err;
  }

  // 이미지 파일 경로 확인
  const imagePath = userAmulet.imageUrl
    ? path.join(__dirname, '../../', userAmulet.imageUrl)
    : null;

  if (!imagePath || !fs.existsSync(imagePath)) {
    const err = new Error('이미지 파일을 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }

  // 다운로드 이력 저장
  await amuletRepository.saveDownload(userId, userAmuletId);

  return { imagePath, name: userAmulet.name };
};
