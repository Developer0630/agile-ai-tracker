const Sprint = require('../models/Sprint');
const Task = require('../models/Task');

// @desc    Lấy Sprint đang ACTIVE của 1 Project
// @route   GET /api/sprints/project/:projectId/active
exports.getActiveSprint = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Tìm Sprint thuộc project có status là active (không phân biệt hoa/thường)
    const activeSprint = await Sprint.findOne({
      projectId,
      status: { $regex: /^active$/i }
    });

    if (!activeSprint) {
      return res.status(200).json({ 
        success: true, 
        data: null, 
        message: 'Không có Sprint nào đang chạy' 
      });
    }

    res.status(200).json({ success: true, data: activeSprint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo Sprint mới (Trạng thái mặc định: planned)
// @route   POST /api/sprints
exports.createSprint = async (req, res) => {
  try {
    const { projectId, name, goal, startDate, endDate } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({ success: false, message: 'Thiếu projectId hoặc tên Sprint!' });
    }

    const sprint = await Sprint.create({
      projectId,
      name,
      goal: goal || '',
      startDate,
      endDate,
      status: 'planned'
    });

    res.status(201).json({ success: true, data: sprint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy danh sách tất cả Sprint của 1 Project
// @route   GET /api/sprints/project/:projectId
exports.getSprintsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const sprints = await Sprint.find({ projectId })
      .sort({ createdAt: -1 })
      .lean();

    const sprintIds = sprints.map((s) => s._id);
    const tasks = await Task.find({ sprintId: { $in: sprintIds } })
      .populate('assigneeId', 'name email');

    const result = sprints.map((sprint) => ({
      ...sprint,
      tasks: tasks.filter((task) => task.sprintId?.toString() === sprint._id.toString())
    }));

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy chi tiết 1 Sprint theo ID
// @route   GET /api/sprints/:id
exports.getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Sprint!' });
    }

    const tasks = await Task.find({ sprintId: sprint._id }).populate('assigneeId', 'name email');

    res.status(200).json({ success: true, data: { ...sprint.toObject(), tasks } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bắt đầu Sprint (Start Sprint)
// @route   PUT /api/sprints/:id/start
// Backend: sprintController.js
exports.startSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    const sprint = await Sprint.findById(id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Sprint!' });
    }

    // Tự động hoàn thành (completed) bất kỳ Sprint nào đang active trước đó của Project này
    await Sprint.updateMany(
      {
        projectId: sprint.projectId,
        status: { $regex: /^active$/i },
        _id: { $ne: id }
      },
      { $set: { status: 'completed' } }
    );

    // Kích hoạt Sprint mới
    sprint.status = 'active';
    sprint.startDate = startDate || new Date();
    sprint.endDate = endDate || sprint.endDate;
    await sprint.save();

    res.status(200).json({ 
      success: true, 
      message: 'Đã kích hoạt Sprint thành công!', 
      data: sprint 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hoàn thành Sprint (Complete Sprint)
// @route   PUT /api/sprints/:id/complete
exports.completeSprint = async (req, res) => {
  try {
    const { id } = req.params;

    const sprint = await Sprint.findById(id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Sprint!' });
    }

    sprint.status = 'completed';
    sprint.completedAt = new Date();
    await sprint.save();

    const unfinishedTasks = await Task.updateMany(
      {
        sprintId: id,
        status: { $nin: ['done', 'DONE'] }
      },
      { $set: { sprintId: null } }
    );

    res.status(200).json({
      success: true,
      message: 'Đã hoàn thành Sprint thành công!',
      data: {
        sprint,
        returnedToBacklogCount: unfinishedTasks.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật thông tin Sprint
// @route   PUT /api/sprints/:id
exports.updateSprint = async (req, res) => {
  try {
    const updatedSprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSprint) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Sprint!' });
    }

    res.status(200).json({ success: true, data: updatedSprint });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Xóa Sprint
// @route   DELETE /api/sprints/:id
exports.deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Sprint!' });
    }

    await Task.updateMany({ sprintId: req.params.id }, { $set: { sprintId: null } });

    res.status(200).json({ success: true, message: 'Đã xóa Sprint thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};