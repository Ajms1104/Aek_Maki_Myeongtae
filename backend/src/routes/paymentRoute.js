'use strict';

const express = require('express');
const router = express.Router();
const userRepository = require('../repositories/userRepository');
const authMiddleware = require('../middlewares/authMiddleware');

// 인앱 결제 보상 지급
router.post('/record', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { productType } = req.body;
  
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
        return res.status(404).json({ error: '유저를 찾을 수 없습니다.' });
    }

    if (productType === 'hidden') {
      if (!user.has_hidden_pass) {
        await userRepository.unlockHiddenPass(userId);
        await userRepository.addCredit(userId, 5);
      }
    } else if (productType === 'credit') {
      await userRepository.addCredit(userId, 10);
    }

    const updatedUser = await userRepository.findById(userId);
    return res.status(200).json({
      success: true,
      credits: updatedUser.credits,
      hasHiddenPass: updatedUser.has_hidden_pass
    });
  } catch (err) {
    console.error(`[PAYMENT FATAL ERROR]`, err);
    return res.status(500).json({ error: '상품 지급 처리 중 오류가 발생했습니다.' });
  }
});

// 광고 시청 보상 지급 (10분 쿨타임)
router.post('/reward/ad', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '유저 정보를 찾을 수 없습니다.' });
    }

    const now = new Date();
    if (user.last_ad_watched_at) {
      const lastWatched = new Date(user.last_ad_watched_at);
      const diffMinutes = (now.getTime() - lastWatched.getTime()) / (1000 * 60);
      
      if (diffMinutes < 10) {
        const remaining = Math.ceil(10 - diffMinutes);
        return res.status(429).json({ 
          error: `광고 시청 쿨타임 중입니다. ${remaining}분 후에 다시 시도해주세요.`,
          remainingMinutes: remaining
        });
      }
    }

    const newCredits = await userRepository.addCredit(userId, 1);
    await userRepository.updateAdWatchTime(userId);
    
    return res.status(200).json({ success: true, credits: newCredits });
  } catch (err) {
    console.error(`[AD REWARD FATAL ERROR]`, err);
    return res.status(500).json({ error: '보상 지급 실패' });
  }
});

// 일일 출석 보상 지급 (24시간 1회)
router.post('/reward/attendance', authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '유저 정보를 찾을 수 없습니다.' });
    }

    const now = new Date();
    if (user.last_attendance_at) {
      const lastAttendance = new Date(user.last_attendance_at);
      const diffMs = now.getTime() - lastAttendance.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 24) {
        const remainingHours = Math.ceil(24 - diffHours);
        return res.status(400).json({ 
          error: `아직 출석 보상을 받을 수 없어요. ${remainingHours}시간 후에 다시 만나요!` 
        });
      }
    }

    const newCredits = await userRepository.addCredit(userId, 1);
    await userRepository.updateAttendance(userId);

    return res.status(200).json({
      success: true,
      credits: newCredits,
      message: '반가워요! 오늘의 출석 보상 1 크레딧이 도착했어요 🐟'
    });
  } catch (err) {
    console.error(`[ATTENDANCE FATAL ERROR]`, err);
    return res.status(500).json({ error: '출석 보상 지급 실패' });
  }
});

module.exports = router;
