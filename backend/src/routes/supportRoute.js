'use strict';

const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: 고객센터 문의
 */

/**
 * @swagger
 * /api/v1/support/tickets:
 *   post:
 *     summary: 1:1 문의 등록
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               replyEmail:
 *                 type: string
 *     responses:
 *       201:
 *         description: 문의 접수 완료
 *       400:
 *         description: 제목/내용 누락
 */
router.post('/tickets', authMiddleware, supportController.createTicket);

/**
 * @swagger
 * /api/v1/support/tickets:
 *   get:
 *     summary: 내 문의 목록 조회
 *     tags: [Support]
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
 *         description: 문의 목록
 */
router.get('/tickets', authMiddleware, supportController.getMyTickets);

module.exports = router;