// backend/routes/systemSettingRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllSettings, 
  updateSettingByKey, 
  getSystemStats,
  getAdminUsers,
  updateUserRole,
  deleteUser,
  getAdminProjects,
  deleteProjectByAdmin
} = require('../controllers/systemSettingController');
const { protect } = require('../middleware/authMiddleware');
const { requireSystemAdmin } = require('../middleware/adminMiddleware');

// Public settings cho user đăng nhập
router.get('/', protect, getAllSettings);

// KHU VỰC CHỈ SYSTEM ADMIN TRUY CẬP
router.use(protect, requireSystemAdmin);

router.get('/stats', getSystemStats);
router.put('/:key', updateSettingByKey);

// Quản trị User
router.get('/users/all', getAdminUsers);
router.put('/users/:userId', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Quản trị Dự án
router.get('/projects/all', getAdminProjects);
router.delete('/projects/:projectId', deleteProjectByAdmin);

module.exports = router;