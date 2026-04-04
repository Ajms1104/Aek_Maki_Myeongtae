'use strict';

const express = require('express');
const router = express.Router();
const meController = require('../controllers/meController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Me
 *   description: 내 데이터 관리
 */

/**
 * @swagger
 * /api/v1/me/data:
 *   delete:
 *     summary: 내 데이터 전체 삭제 (탈퇴/초기화)
 *     tags: [Me]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 삭제 완료
 *       401:
 *         description: 인증 실패
 */
router.delete('/data', authMiddleware, meController.deleteMyData);

/**
 * @swagger
 * /api/v1/auth/unlink:
 *   get:
 *     summary: 토스 UNLINK 콜백 (GET)
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: userKey
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: referrer
 *         required: true
 *         schema:
 *           type: string
 *           enum: [UNLINK, WITHDRAWAL_TERMS, WITHDRAWAL_TOSS]
 *     responses:
 *       200:
 *         description: 처리 완료
 *   post:
 *     summary: 토스 UNLINK 콜백 (POST)
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userKey:
 *                 type: number
 *               referrer:
 *                 type: string
 *                 enum: [UNLINK, WITHDRAWAL_TERMS, WITHDRAWAL_TOSS]
 *     responses:
 *       200:
 *         description: 처리 완료
 */
router.get('/unlink', meController.unlinkCallback);
router.post('/unlink', meController.unlinkCallback);

module.exports = router;