'use strict';

const amuletRepository = require('../repositories/amuletRepository');
const userRepository = require('../repositories/userRepository');
const challengeService = require('./challengeService');
const path = require('path');
const fs = require('fs');

// 遺???꾧컧 留덉뒪??議고쉶 (?몄쬆 遺덊븘??
exports.getCatalog = async () => {
  const amulets = await amuletRepository.findAllCatalog();
  return {
    totalCount: amulets.length,
    amulets,
  };
};

// ??蹂댁쑀 遺??議고쉶
exports.getMyAmulets = async (userId) => {
  const owned = await amuletRepository.findUserInventory(userId);
  return { owned };
};

// ?좎? 遺???꾧컧 議고쉶 (移댄깉濡쒓렇 + 蹂댁쑀 議고빀)
exports.getCollection = async (userId) => {
  const items = await amuletRepository.findCollection(userId);
  const user = await userRepository.findById(userId);
  const challenges = await challengeService.getChallengeProgress(userId, user);

  const totalCount = items.length;
  const ownedCount = items.filter((i) => !i.isLocked).length;
  const collectionRate =
    totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  return { 
    collectionRate, 
    totalCount, 
    ownedCount, 
    credits: user ? user.credits : 0, // ?щ젅??異붽?
    hasHiddenPass: user ? user.has_hidden_pass : false,
    lastAdWatchedAt: user ? user.last_ad_watched_at : null,
    attendanceStreak: user ? user.current_attendance_streak : 0,
    challenges,
    items 
  };
};

// ??遺???ㅼ슫濡쒕뱶
exports.downloadAmulet = async (userId, userAmuletId) => {
  // 蹂댁쑀 ?щ? ?뺤씤
  const userAmulet = await amuletRepository.findUserAmulet(userId, userAmuletId);
  if (!userAmulet) {
    const err = new Error('蹂댁쑀?섏? ?딆? 遺?곸엯?덈떎.');
    err.status = 404;
    throw err;
  }

  // ?대?吏 ?뚯씪 寃쎈줈 ?뺤씤
  const imagePath = userAmulet.imageUrl
    ? path.join(__dirname, '../../', userAmulet.imageUrl)
    : null;

  if (!imagePath || !fs.existsSync(imagePath)) {
    const err = new Error('?대?吏 ?뚯씪??李얠쓣 ???놁뒿?덈떎.');
    err.status = 404;
    throw err;
  }

  // ?ㅼ슫濡쒕뱶 ?대젰 ???
  await amuletRepository.saveDownload(userId, userAmuletId);

  return { imagePath, name: userAmulet.name };
};

// ?꾩껜 ?듦퀎 議고쉶
exports.getTotalStats = async () => {
  return await amuletRepository.getTotalStats();
};

