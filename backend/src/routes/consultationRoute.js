'use strict';

const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Consultation
 *   description: 유저 고민 상담 관련  
 */

/**
 * @swagger
 * /api/v1/consultations:
 *   post:
 *     summary: 고민 등록 + 부적 발급
 *     tags: [Consultation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 300
 *                 example: 요즘 취업이 너무 걱정돼요
 *               category:
 *                 type: string
 *                 example: 취업
 *     responses:
 *       200:
 *         description: 상담 완료 및 부적 지급
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.post('/', authMiddleware, consultationController.createConsultation);

/**
 * @swagger
 * /api/v1/consultations:
 *   get:
 *     summary: 고민 목록 조회
 *     tags: [Consultation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 목록 반환
 *       401:
 *         description: 인증 실패
 */
router.get('/', authMiddleware, consultationController.getConsultations);

/**
 * @swagger
 * /api/v1/consultations/{consultationId}:
 *   get:
 *     summary: 고민 단건 조회
 *     tags: [Consultation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: consultationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 상담 상세
 *       404:
 *         description: 존재하지 않거나 본인 글이 아님
 *   delete:
 *     summary: 고민 히스토리 삭제
 *     tags: [Consultation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: consultationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 완료
 *       404:
 *         description: 존재하지 않거나 본인 글이 아님
 */
router.get('/:consultationId', authMiddleware, consultationController.getConsultation);
router.delete('/:consultationId', authMiddleware, consultationController.deleteConsultation);

/**
 * @swagger
 * /api/v1/consultations/{consultationId}/reaction:
 *   put:
 *     summary: LLM 답변 평가 (좋아요/싫어요/해제)
 *     tags: [Consultation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: consultationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reaction]
 *             properties:
 *               reaction:
 *                 type: string
 *                 enum: [LIKE, DISLIKE, NONE]
 *     responses:
 *       200:
 *         description: 평가 저장 완료
 *       404:
 *         description: 존재하지 않거나 본인 글이 아님
 */
router.put('/:consultationId/reaction', authMiddleware, consultationController.updateReaction);

module.exports = router;