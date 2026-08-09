const express = require('express');
const router = express.Router();
const {
  createSprint,
  getSprintsByProject,
  getSprintById,
  startSprint,
  completeSprint,
  updateSprint,
  deleteSprint
} = require('../controllers/sprintController');

// Quản lý danh sách & tạo Sprint
router.post('/', createSprint);
router.get('/project/:projectId', getSprintsByProject);
router.get('/:id', getSprintById);

// Cập nhật trạng thái vòng đời Sprint
router.put('/:id/start', startSprint);
router.put('/:id/complete', completeSprint);

// Cập nhật & Xóa
router.put('/:id', updateSprint);
router.delete('/:id', deleteSprint);

module.exports = router;