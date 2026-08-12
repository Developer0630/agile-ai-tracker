// Trong activityController.js
const express = require('express');
const router = express.Router();
const { getTaskActivities } = require('../controllers/taskController'); // Hoặc file controller chứa hàm getTaskActivities
const { protect } = require('../middleware/authMiddleware');

// Route GET lấy activity theo taskId
router.get('/:taskId', protect, getTaskActivities);

module.exports = router;