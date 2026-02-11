const express = require('express');
const router = express.Router();
const worryController = require('../controllers/worryController');

router.post('/consume', worryController.createWorry);

module.exports = router;