'use strict';

const express = require('express');
const router = express.Router();
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

module.exports = router;
