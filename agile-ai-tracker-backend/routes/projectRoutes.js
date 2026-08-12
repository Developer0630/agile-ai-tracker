const express = require('express');
const router = express.Router();
const { getUserProjects, createProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserProjects);
router.post('/', protect, createProject);

module.exports = router;