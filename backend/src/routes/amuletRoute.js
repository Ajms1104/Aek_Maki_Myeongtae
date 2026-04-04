'use strict';

const express = require('express');
const router = express.Router();
const amuletController = require('../controllers/amuletController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Amulet
 *   description: 부적 관련 API
 */

/**
 * @swagger
 * /api/v1/amulets/catalog:
 *   get:
 *     summary: 부적 도감 마스터 조회 (인증 불필요)
 *     tags: [Amulet]
 *     responses:
 *       200:
 *         description: 전체 부적 목록
 */
router.get('/catalog', amuletController.getCatalog);

/**
 * @swagger
 * /api/v1/amulets/me:
 *   get:
 *     summary: 내 보유 부적 조회
 *     tags: [Amulet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 보유 부적 목록
 *       401:
 *         description: 인증 실패
 */
router.get('/me', authMiddleware, amuletController.getMyAmulets);

/**
 * @swagger
 * /api/v1/amulets/collection:
 *   get:
 *     summary: 내 부적 도감 조회 (카탈로그 + 보유 조합)
 *     tags: [Amulet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 도감 조회 결과
 *       401:
 *         description: 인증 실패
 */
router.get('/collection', authMiddleware, amuletController.getCollection);

/**
 * @swagger
 * /api/v1/amulets/{userAmuletId}/download:
 *   get:
 *     summary: 내 부적 다운로드
 *     tags: [Amulet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userAmuletId
 *         required: true
 *         schema:
 *           type: string
 *         description: 부적 ID
 *     responses:
 *       200:
 *         description: 이미지 파일 다운로드
 *       404:
 *         description: 보유하지 않은 부적 또는 이미지 없음
 *       401:
 *         description: 인증 실패
 */
router.get('/:userAmuletId/download', authMiddleware, amuletController.downloadAmulet);

module.exports = router;