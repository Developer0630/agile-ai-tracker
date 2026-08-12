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
  deleteTask,
  addComment,
} = require('../controllers/taskController');
const { toggleSubtask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
// 1. Quản lý Task chung & Backlog
router.get('/', protect, getAllTasks); // Lấy toàn bộ task
router.post('/', protect, createTask); // Tạo task mới
router.get('/project/:projectId', protect, getTasksByProject); // Task theo Project
router.get('/backlog/:projectId', protect, getBacklogTasks); // Product Backlog
router.get('/sprint/:sprintId', protect, getTasksBySprint); // Sprint Backlog (Kanban)

// 2. Cập nhật & Xóa Task
router.put('/:id/status', protect, updateTaskStatus); // Cập nhật trạng thái kéo/thả Kanban
router.put('/:id', protect, updateTask); // Cập nhật chung (đổi Sprint, sửa nội dung)
router.delete('/:id', protect, deleteTask); // Xóa task

router.patch('/:taskId/subtasks/:subtaskId', protect, toggleSubtask);
router.post('/:id/comment', protect, addComment);
module.exports = router;