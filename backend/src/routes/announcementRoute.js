'use strict';

const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

/**
 * @swagger
 * tags:
 *   name: Announcement
 *   description: 공지사항
 */

/**
 * @swagger
 * /api/v1/announcements:
 *   get:
 *     summary: 공지사항 조회
 *     tags: [Announcement]
 *     responses:
 *       200:
 *         description: 공지사항 목록
 */
router.get('/', announcementController.getAnnouncements);

module.exports = router;