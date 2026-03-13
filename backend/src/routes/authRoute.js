'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 토스 로그인 인증
 */

/**
 * @swagger
 * /api/v1/auth/toss/exchange:
 *   post:
 *     summary: 토스 인가코드 교환 → 서비스 JWT 발급
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - authorizationCode
 *               - referrer
 *             properties:
 *               authorizationCode:
 *                 type: string
 *                 description: 토스 appLogin()에서 받은 인가코드 (유효시간 10분)
 *                 example: abc123
 *               referrer:
 *                 type: string
 *                 enum: [DEFAULT, sandbox]
 *                 description: 토스앱=DEFAULT, 샌드박스=sandbox
 *                 example: DEFAULT
 *     responses:
 *       200:
 *         description: JWT 발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *                   example: 7d
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 필수 파라미터 누락
 *       502:
 *         description: 토스 API 호출 실패
 */
router.post('/toss/exchange', authController.tossExchange);

module.exports = router;