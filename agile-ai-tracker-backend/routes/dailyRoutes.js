const express = require('express');
const router = express.Router();
const { submitDailyReport } = require('../controllers/dailyController');

router.post('/', submitDailyReport);

module.exports = router;