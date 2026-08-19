const express = require('express');
const router = express.Router();
const { 
  getUserProjects, 
  createProject, 
  getProjectMembers,
  addMember,
  updateMemberRole,
  removeMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { requireProjectRole } = require('../middleware/authProjectRole');

router.get('/', protect, getUserProjects);
router.post('/', protect, createProject);

// Quản lý thành viên trong dự án
router.get('/:projectId/members', protect, getProjectMembers);
router.post('/:projectId/members', protect, requireProjectRole(['ADMIN', 'PM']), addMember);
router.put('/:projectId/members/:memberId', protect, requireProjectRole(['ADMIN', 'PM']), updateMemberRole);
router.delete('/:projectId/members/:memberId', protect, requireProjectRole(['ADMIN', 'PM']), removeMember);

module.exports = router;