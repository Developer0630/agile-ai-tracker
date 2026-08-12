const express = require('express');
const router = express.Router();
const { getUserProjects, createProject, getProjectMembers } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserProjects);
router.post('/', protect, createProject);
router.get('/:projectId/members', getProjectMembers);
module.exports = router;