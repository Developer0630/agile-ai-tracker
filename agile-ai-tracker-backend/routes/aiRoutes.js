const express = require('express');
const router = express.Router();
const { parseNaturalLanguageTask } = require('../controllers/aiController');

router.post('/parse-task', parseNaturalLanguageTask);
router.post('/breakdown/:taskId', require('../controllers/aiController').breakdownTaskWithAI);
router.post('/project-health-check', require('../controllers/aiController').projectHealthCheck);
module.exports = router;