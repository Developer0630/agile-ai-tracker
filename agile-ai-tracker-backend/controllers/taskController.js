const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { logActivity } = require('./activityController');
const mongoose = require('mongoose');

// 1. Lấy toàn bộ danh sách Task
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assigneeId', 'name email');
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Tạo Task mới
exports.createTask = async (req, res) => {
  try {
    const taskData = { ...req.body };
    if (!taskData.assigneeId || taskData.assigneeId === '') {
      taskData.assigneeId = null;
    }

    const task = await Task.create(taskData);
    
    // Ghi log khi tạo task mới
    const taskId = task._id || task.id;
    const userId = req.user?.id;
    if (taskId && userId) {
      await logActivity(taskId, userId, "đã tạo task mới", task.title);
    }

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 3. Lấy Task theo Dự án
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const tasks = await Task.find({ projectId }).populate('assigneeId', 'name email');
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Lấy danh sách Product Backlog (Task chưa thuộc Sprint nào)
exports.getBacklogTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const tasks = await Task.find({
      projectId,
      $or: [
        { sprintId: null },
        { sprintId: { $exists: false } }
      ]
    }).populate('assigneeId', 'name email');

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Lỗi getBacklogTasks:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 5. Lấy Task theo Sprint (Kanban Active Sprint) - Đã bọc chống lỗi Cast ObjectId
exports.getTasksBySprint = async (req, res) => {
  try {
    const { sprintId } = req.params;

    // Tránh crash Mongoose nếu sprintId là null, chuỗi rỗng "" hoặc "undefined"
    if (!sprintId || !mongoose.Types.ObjectId.isValid(sprintId)) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const tasks = await Task.find({ sprintId }).populate('assigneeId', 'name email');
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Cập nhật trạng thái Task (Kéo thả Kanban)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy Task!' });

    if (userId) {
      await logActivity(id, userId, "đã đổi trạng thái", `sang ${status}`);
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 7. Cập nhật thông tin Task chung
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID Task không hợp lệ!' });
    }

    const updateData = { ...req.body };
    if ('assigneeId' in updateData) {
      if (!updateData.assigneeId || updateData.assigneeId === '' || updateData.assigneeId === 'null') {
        updateData.assigneeId = null;
      }
    }
    if ('sprintId' in updateData) {
      const rawSprintId = updateData.sprintId;
      if (
        rawSprintId === null || 
        rawSprintId === '' || 
        rawSprintId === 'null' || 
        rawSprintId === undefined ||
        !mongoose.Types.ObjectId.isValid(rawSprintId)
      ) {
        updateData.sprintId = null;
      }
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('assigneeId', 'name email');
    
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy Task!' });
    const userId = req.user?.id;
    if (userId) {
      await logActivity(id, userId, "đã cập nhật thông tin", "của task");
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 8. Xóa Task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID Task không hợp lệ!' });
    }

    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy Task!' });

    res.status(200).json({ success: true, message: 'Đã xóa Task thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.toggleSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy task!' });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy subtask!' });
    }

    // Đảo ngược trạng thái completed
    subtask.completed = !subtask.completed;
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật subtask thành công!',
      data: task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Phải có chữ "exports." ở trước tên hàm thế này:
exports.getTaskActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ taskId: req.params.taskId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params; // taskId
    const { content } = req.body;
    const userId = req.user.id;

    // Ghi log với hành động là 'comment'
    await logActivity(id, userId, "đã bình luận", content);

    res.status(200).json({ success: true, message: "Đã thêm bình luận" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};