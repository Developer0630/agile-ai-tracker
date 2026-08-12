const express = require('express');
const router = express.Router();
const { parseNaturalLanguageTask } = require('../controllers/aiController');

router.post('/parse-task', parseNaturalLanguageTask);
router.post('/breakdown/:taskId', require('../controllers/aiController').breakdownTaskWithAI);
module.exports = router;