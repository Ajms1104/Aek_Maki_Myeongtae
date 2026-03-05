const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middlewares/adminAuthMiddleware');

// 파일 저장 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 부적 확률 관리
router.get('/probabilities', verifyAdmin, adminController.getProbabilities);
router.put('/amulets/:id/probability', verifyAdmin, adminController.updateAmuletProbability);
router.post('/probabilities/publish', verifyAdmin, adminController.publishProbabilities);

// 부적 상세 관리
router.post('/amulets', verifyAdmin, upload.single('imageFile'), adminController.createAmulet);
router.patch('/amulets/:id', verifyAdmin, upload.single('imageFile'), adminController.updateAmulet);
router.delete('/amulets/:id', verifyAdmin, adminController.deleteAmulet);

module.exports = router;
