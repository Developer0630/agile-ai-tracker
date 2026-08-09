const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTasksByProject,
  getBacklogTasks,
  getTasksBySprint,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');

// 1. Quản lý Task chung & Backlog
router.get('/', getAllTasks); // Lấy toàn bộ task
router.post('/', createTask); // Tạo task mới
router.get('/project/:projectId', getTasksByProject); // Task theo Project
router.get('/backlog/:projectId', getBacklogTasks); // Product Backlog
router.get('/sprint/:sprintId', getTasksBySprint); // Sprint Backlog (Kanban)

// 2. Cập nhật & Xóa Task
router.put('/:id/status', updateTaskStatus); // Cập nhật trạng thái kéo/thả Kanban
router.put('/:id', updateTask); // Cập nhật chung (đổi Sprint, sửa nội dung)
router.delete('/:id', deleteTask); // Xóa task

module.exports = router;