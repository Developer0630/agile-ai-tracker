const Task = require('../models/Task');

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
    const tasks = await Task.find({ projectId: req.params.projectId }).populate('assigneeId', 'name email');
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Lấy danh sách Product Backlog (Task chưa thuộc Sprint nào)
exports.getBacklogTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      projectId: req.params.projectId,
      $or: [
        { sprintId: null },
        { sprintId: { $exists: false } },
        { sprintId: '' }
      ]
    }).populate('assigneeId', 'name email');

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Lấy Task theo Sprint (Kanban Active Sprint)
exports.getTasksBySprint = async (req, res) => {
  try {
    const tasks = await Task.find({ sprintId: req.params.sprintId }).populate('assigneeId', 'name email');
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Cập nhật trạng thái Task (Kéo thả Kanban)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, isBlocked, blockerReason } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, isBlocked, blockerReason },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy Task!' });

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 7. Cập nhật thông tin Task chung (Sửa tiêu đề, gán/huỷ Sprint)
exports.updateTask = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if ('sprintId' in updateData) {
      const rawSprintId = updateData.sprintId;
      if (rawSprintId === null || rawSprintId === '' || rawSprintId === 'null' || rawSprintId === undefined) {
        updateData.sprintId = null;
      }
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
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
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy Task!' });

    res.status(200).json({ success: true, message: 'Đã xóa Task thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};