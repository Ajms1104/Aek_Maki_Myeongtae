'use strict';

const express = require('express');
const router = express.Router();
const worryController = require('../controllers/worryController');

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
 *                 example: 요즘 취업이 너무 걱정돼요
 *               category:
 *                 type: string
 *                 example: 취업
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
 *                 consultationId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: DONE
 *                 reply:
 *                   type: string
 *                 amulets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       amuletId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       grade:
 *                         type: string
 *                       isNew:
 *                         type: boolean
 *                 deleteAt:
 *                   type: string
 *                   format: date-time
 *       202:
 *         description: 비동기 처리 중 (mode=ASYNC)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 consultationId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: PENDING
 *       400:
 *         description: 잘못된 요청 (내용 누락, 금칙어 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       409:
 *         description: Idempotency-Key 충돌 (같은 키, 다른 body)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/consume', worryController.createWorry);

module.exports = router;