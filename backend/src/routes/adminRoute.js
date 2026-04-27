'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middlewares/adminAuthMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: 관리자 전용 API (Admin JWT 필요)
 */

/**
 * @swagger
 * /api/v1/admin/probabilities:
 *   get:
 *     summary: 관리자 - 부적 확률 목록 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 부적 확률 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   probability:
 *                     type: number
 *       401:
 *         description: 관리자 인증 실패
 */
router.get('/probabilities', verifyAdmin, adminController.getProbabilities);

/**
 * @swagger
 * /api/v1/admin/amulets/{id}/probability:
 *   put:
 *     summary: 관리자 - 부적 확률 수정
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 부적 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - probability
 *             properties:
 *               probability:
 *                 type: number
 *                 example: 0.15
 *     responses:
 *       200:
 *         description: 확률 수정 완료
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 관리자 인증 실패
 *       404:
 *         description: 부적 없음
 */
router.put('/amulets/:id/probability', verifyAdmin, adminController.updateAmuletProbability);

/**
 * @swagger
 * /api/v1/admin/probabilities/publish:
 *   post:
 *     summary: 관리자 - 부적 확률 발행 (드래프트 -> 적용)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 발행 완료
 *       401:
 *         description: 관리자 인증 실패
 */
router.post('/probabilities/publish', verifyAdmin, adminController.publishProbabilities);

/**
 * @swagger
 * /api/v1/admin/amulets:
 *   post:
 *     summary: 관리자 - 부적 생성
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - grade
 *             properties:
 *               name:
 *                 type: string
 *                 example: 합격 명태
 *               grade:
 *                 type: string
 *                 enum: [COMMON, RARE, EPIC, LEGENDARY]
 *               description:
 *                 type: string
 *               imageFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: 부적 생성 완료
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 관리자 인증 실패
 */
router.post('/amulets', verifyAdmin, upload.single('imageFile'), adminController.createAmulet);

/**
 * @swagger
 * /api/v1/admin/amulets/{id}:
 *   patch:
 *     summary: 관리자 - 부적 수정
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               grade:
 *                 type: string
 *                 enum: [COMMON, RARE, EPIC, LEGENDARY]
 *               description:
 *                 type: string
 *               imageFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 수정 완료
 *       401:
 *         description: 관리자 인증 실패
 *       404:
 *         description: 부적 없음
 *
 *   delete:
 *     summary: 관리자 - 부적 삭제
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 완료
 *       401:
 *         description: 관리자 인증 실패
 *       404:
 *         description: 부적 없음
 */
router.patch('/amulets/:id', verifyAdmin, upload.single('imageFile'), adminController.updateAmulet);
router.delete('/amulets/:id', verifyAdmin, adminController.deleteAmulet);


/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: 관리자 - 전체 유저 리스트 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 유저 목록
 */
router.get('/users', verifyAdmin, adminController.getUsers);

/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   get:
 *     summary: 관리자 - 개별 유저 상세 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 유저 상세
 *       404:
 *         description: 유저 없음
 */
router.get('/users/:userId', verifyAdmin, adminController.getUserDetail);
router.patch('/users/:userId/unlock', verifyAdmin, adminController.updateUserUnlock);

/**
 * @swagger
 * /api/v1/admin/support/tickets:
 *   get:
 *     summary: 관리자 - 문의 리스트 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: ALL
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: 문의 목록
 */
router.get('/support/tickets', verifyAdmin, adminController.getSupportTickets);

/**
 * @swagger
 * /api/v1/admin/support/tickets/{ticketId}:
 *   patch:
 *     summary: 관리자 - 문의 상태 변경/답변 등록 
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               replyContent:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 완료
 *       404:
 *         description: 문의 없음
 */
router.patch('/support/tickets/:ticketId', verifyAdmin, adminController.updateSupportTicket);


/**
 * @swagger
 * /api/v1/admin/users/{userId}/amulets:
 *   get:
 *     summary: 관리자 - 특정 유저의 보유 부적 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 보유 부적 목록
 *
 *   post:
 *     summary: 관리자 - 특정 유저에게 부적 지급
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amuletId]
 *             properties:
 *               amuletId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 지급 완료
 */
router.get('/users/:userId/amulets', verifyAdmin, adminController.getUserAmulets);
router.post('/users/:userId/amulets', verifyAdmin, adminController.addAmuletToUser);

/**
 * @swagger
 * /api/v1/admin/user-amulets/{userAmuletId}:
 *   delete:
 *     summary: 관리자 - 유저 보유 부적 회수
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userAmuletId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 회수 완료
 */
router.delete('/user-amulets/:userAmuletId', verifyAdmin, adminController.deleteUserAmulet);


module.exports = router;