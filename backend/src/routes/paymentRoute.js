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

    // 🔒 [결제 완료 감사 로그 적재]
    await db.query(
      "INSERT INTO user_access_logs (user_id, action, meta_data) VALUES ($1, $2, $3)",
      [
        userId,
        'PAYMENT_SUCCESS',
        JSON.stringify({
          productType,
          grantedCredits: productType === 'credit' ? 10 : 0,
          unlockedHiddenPass: productType === 'hidden'
        })
      ]
    );

    // 🔒 [결제 도전과제 평가]
    let awards = [];
    if (productType === 'hidden' || productType === 'credit') {
      const challengeResult = await challengeService.evaluatePayment(userId, productType);
      awards = challengeResult.awards;
    }

    const updatedUser = await userRepository.findById(userId);
    return res.status(200).json({
      success: true,
      credits: updatedUser.credits,
      hasHiddenPass: updatedUser.has_hidden_pass,
      awards,
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
          error: '오늘의 출석 체크를 이미 완료했어요. 내일 자정(00시) 이후에 다시 만나요!',
        });
      }
    }

    const attendanceStreak = challengeService.calculateNextAttendanceStreak(
      user.last_attendance_at,
      user.current_attendance_streak || 0,
      now
    );

    // 🔒 [출석 보상 크레딧 지급]
    // 출석 시 무조건 1크레딧을 추가 지급합니다.
    await userRepository.addCredit(userId, 1);

    await userRepository.updateAttendance(userId, attendanceStreak);

    // 🔒 [누적 출석용] 출석 이력 로깅
    await db.query(
      "INSERT INTO user_access_logs (user_id, action, duration_seconds) VALUES ($1, 'ATTENDANCE', 0)",
      [userId]
    );

    const challengeResult = await challengeService.evaluateAttendance(userId, attendanceStreak);
    
    // 최종 가산된 최신 크레딧 정보를 DB에서 다시 동기화합니다.
    const updatedUser = await userRepository.findById(userId);

    const hasAward = challengeResult.awards.length > 0;
    const msg = hasAward
      ? `🎉 ${challengeResult.awards[challengeResult.awards.length - 1].title} 달성! 보상으로 크레딧을 받았어요!`
      : `오늘의 출석 체크가 완료되었습니다! (${attendanceStreak}일 연속) (🎁 1 크레딧이 충전되었습니다!)`;

    return res.status(200).json({
      success: true,
      credits: updatedUser.credits,
      attendanceStreak,
      awards: challengeResult.awards,
      message: msg,
    });
  } catch (err) {
    console.error('[ATTENDANCE FATAL ERROR]', err);
    return res.status(500).json({ error: 'Failed to process attendance.' });
  }
});

router.post('/reward/viral', authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  // ⚠️ [긴급 점검 핫픽스] 토스 AIT 승인 대기 시간 동안 유저 불만 방지용 임시 점검 공지 차단
  return res.status(400).json({
    error: '⚠️ 현재 공유 보상 지급 시스템 긴급 정비 중입니다. 최신 버전 승인 완료 후 즉시 지급 재개됩니다!'
  });

  try {
    const result = await db.transaction(async (client) => {
      // 1. 유저 정보 조회와 동시에 비관적 락(FOR UPDATE) 획득
      const { rows: userRows } = await client.query(
        'SELECT id, credits FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );
      
      if (userRows.length === 0) {
        const err = new Error('User not found.');
        err.status = 404;
        throw err;
      }

      // 2. 일일 공유 보상 횟수 검증 (KST 기준 하루 최대 5회)
      const kstToday = challengeService.toKoreaDateKey(new Date());
      const { rows: countRows } = await client.query(
        `SELECT COUNT(*) FROM user_access_logs 
         WHERE user_id = $1 AND action = 'VIRAL_REWARD' 
           AND DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul') = DATE($2)`,
        [userId, kstToday]
      );
      
      const todayCount = parseInt(countRows[0].count || '0');
      if (todayCount >= 5) {
        const err = new Error('친구 공유 보상은 하루에 최대 5회까지만 받을 수 있어요. 내일 다시 도전해 주세요!');
        err.status = 400;
        throw err;
      }

      // 3. 1 크레딧 가산
      const { rows: updateRows } = await client.query(
        'UPDATE users SET credits = credits + 1 WHERE id = $1 RETURNING credits',
        [userId]
      );
      const updatedCredits = updateRows[0].credits;
      
      // 4. 이력 로깅 (Idempotency 및 한도 계산용)
      await client.query(
        "INSERT INTO user_access_logs (user_id, action, duration_seconds) VALUES ($1, 'VIRAL_REWARD', 0)",
        [userId]
      );

      return {
        success: true,
        credits: updatedCredits,
        message: '친구 공유 완료 보상으로 1 크레딧을 받았어요!',
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[VIRAL REWARD ERROR]', err);
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to grant viral reward.' });
  }
});

module.exports = router;
