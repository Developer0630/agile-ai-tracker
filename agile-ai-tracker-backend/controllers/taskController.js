const Task = require('../models/Task');
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
    const task = await Task.create(req.body);
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID Task không hợp lệ!' });
    }

    const { status, isBlocked, blockerReason } = req.body;
    const task = await Task.findByIdAndUpdate(
      id,
      { status, isBlocked, blockerReason },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy Task!' });

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