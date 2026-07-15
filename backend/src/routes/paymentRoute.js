'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db');
const userRepository = require('../repositories/userRepository');
const challengeService = require('../services/challengeService');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/record', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { productType } = req.body;

  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (productType === 'hidden') {
      if (!user.has_hidden_pass) {
        await userRepository.unlockHiddenPassWithCredits(userId, 5);
      }
    } else if (productType === 'credit') {
      await userRepository.addCredit(userId, 10);
    }

    const updatedUser = await userRepository.findById(userId);
    return res.status(200).json({
      success: true,
      credits: updatedUser.credits,
      hasHiddenPass: updatedUser.has_hidden_pass,
    });
  } catch (err) {
    console.error('[PAYMENT FATAL ERROR]', err);
    return res.status(500).json({ error: 'Failed to grant product.' });
  }
});

router.post('/reward/attendance', authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const now = new Date();
    if (user.last_attendance_at) {
      const lastKey = challengeService.toKoreaDateKey(user.last_attendance_at);
      const nowKey = challengeService.toKoreaDateKey(now);

      if (lastKey === nowKey) {
        return res.status(400).json({
          error: '오늘의 출석 보상을 이미 받았어요. 내일 자정(00시) 이후에 다시 만나요!',
        });
      }
    }

    const attendanceStreak = challengeService.calculateNextAttendanceStreak(
      user.last_attendance_at,
      user.current_attendance_streak || 0,
      now
    );

    let credits = await userRepository.addCredit(userId, 1);
    await userRepository.updateAttendance(userId, attendanceStreak);

    const challengeResult = await challengeService.evaluateAttendance(userId, attendanceStreak);
    if (challengeResult.awards.length > 0) {
      credits = challengeResult.awards[challengeResult.awards.length - 1].credits;
    }

    return res.status(200).json({
      success: true,
      credits,
      attendanceStreak,
      awards: challengeResult.awards,
      message: '오늘의 출석 보상으로 1 토큰을 받았어요!',
    });
  } catch (err) {
    console.error('[ATTENDANCE FATAL ERROR]', err);
    return res.status(500).json({ error: 'Failed to grant attendance reward.' });
  }
});

router.post('/reward/viral', authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // 🔒 [보안 추가] 무차별 API 오작동 및 매크로 방지용 일일 보상 횟수 제약 (하루 최대 5회, 즉 10 크레딧까지만 가능)
    const kstToday = challengeService.toKoreaDateKey(new Date());
    const { rows: countRows } = await db.query(
      `SELECT COUNT(*) FROM user_access_logs 
       WHERE user_id = $1 AND action = 'VIRAL_REWARD' 
         AND DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul') = DATE($2)`,
      [userId, kstToday]
    );
    
    const todayCount = parseInt(countRows[0].count || '0');
    if (todayCount >= 5) {
      return res.status(400).json({
        error: '친구 공유 보상은 하루에 최대 5회까지만 받을 수 있어요. 내일 다시 도전해 주세요!',
      });
    }

    // 1 크레딧 가산 (리워드 밸런스 조정)
    const updatedCredits = await userRepository.addCredit(userId, 1);
    
    // 이력 로깅 (Idempotency 및 한도 계산용)
    await db.query(
      "INSERT INTO user_access_logs (user_id, action, duration_seconds) VALUES ($1, 'VIRAL_REWARD', 0)",
      [userId]
    );

    return res.status(200).json({
      success: true,
      credits: updatedCredits,
      message: '친구 공유 완료 보상으로 1 크레딧을 받았어요!',
    });
  } catch (err) {
    console.error('[VIRAL REWARD ERROR]', err);
    return res.status(500).json({ error: 'Failed to grant viral reward.' });
  }
});

module.exports = router;
