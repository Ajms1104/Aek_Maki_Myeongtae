'use strict';

const express = require('express');
const router = express.Router();
const worryController = require('../controllers/worryController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Worry
 *   description: 고민 상담 및 부적 지급
 */

/**
 * @swagger
 * /api/v1/worry/consume:
 *   post:
 *     summary: 고민 등록 및 부적 지급
 *     tags: [Worry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *         description: 중복 지급 방지용 고유 키
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 300
 *                 example: 테스트고민아무거나적어요
 *               category:
 *                 type: string
 *                 example: 일상
 *               mode:
 *                 type: string
 *                 enum: [SYNC, ASYNC]
 *                 default: SYNC
 *     responses:
 *       200:
 *         description: 상담 완료 및 부적 지급
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 historyId:
 *                   type: string
 *                 llmResponse:
 *                   type: string
 *                 amulet:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     grade:
 *                       type: string
 *                     isNew:
 *                       type: boolean
 *       401:
 *         description: 인증 토큰 없음
 *       400:
 *         description: 잘못된 요청
 */
router.post('/consume', authMiddleware, worryController.createWorry); // ✅ authMiddleware 추가


/**
 * @swagger
 * /api/v1/worry/amulets/{userAmuletId}/download:
 *   get:
 *     summary: 내 부적 다운로드
 *     description: 유저가 소유한 부적을 이미지 파일로 다운로드합니다.
 *     tags: [Worry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userAmuletId
 *         required: true
 *         description: 고유 ID
 *     responses:
 *       200:
 *         description: 성공적으로 파일 전송됨
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: 토큰이 만료되었거나 올바르지 않음
 *       404:
 *         description: 파일을 찾을 수 없거나 다운로드 권한이 없음
 *         content:
 *           application/json:
 *             example: { "error": "부적을 찾을 수 없거나 소유 권한이 없습니다." }
 */
router.get('/amulets/:userAmuletId/download', authMiddleware, worryController.downloadMyAmulet);


module.exports = router;