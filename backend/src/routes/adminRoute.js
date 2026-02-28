const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middlewares/adminAuthMiddleware');

// 3-1. 부적 확률 수정
router.put('/amulets/:id/probability', verifyAdmin, adminController.updateAmuletProbability);

module.exports = router;
