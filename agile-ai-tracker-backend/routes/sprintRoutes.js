const express = require('express');
const router = express.Router();
const {
  createSprint,
  getSprintsByProject,
  getActiveSprint, // 1. Import thêm hàm lấy Active Sprint
  getSprintById,
  startSprint,
  completeSprint,
  updateSprint,
  deleteSprint
} = require('../controllers/sprintController');

// Quản lý danh sách & tạo Sprint
router.post('/', createSprint);
router.get('/project/:projectId', getSprintsByProject);

// 2. KHAI BÁO ROUTE ACTIVE SPRINT Ở ĐÂY (Phải đặt TRƯỚC router.get('/:id'))
router.get('/project/:projectId/active', getActiveSprint);

// Lấy chi tiết theo Sprint ID (Bắt buộc phải khai báo SAU các route cụ thể)
router.get('/:id', getSprintById);

// Cập nhật trạng thái vòng đời Sprint
router.put('/:id/start', startSprint);
router.put('/:id/complete', completeSprint);

// Cập nhật & Xóa
router.put('/:id', updateSprint);
router.delete('/:id', deleteSprint);

module.exports = router;