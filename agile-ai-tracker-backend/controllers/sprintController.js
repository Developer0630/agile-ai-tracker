const Sprint = require('../models/Sprint');
const Task = require('../models/Task');

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

// @desc    Lấy danh sách tất cả Sprint của 1 Project (Kèm danh sách các Task thuộc từng Sprint)
// @route   GET /api/sprints/project/:projectId
exports.getSprintsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const sprints = await Sprint.find({ projectId })
      .sort({ createdAt: -1 })
      .lean();

    // Lấy kèm toàn bộ Task thuộc các Sprint này
    const sprintIds = sprints.map((s) => s._id);
    const tasks = await Task.find({ sprintId: { $in: sprintIds } })
      .populate('assigneeId', 'name email');

    // Gom nhóm Task vào từng Sprint tương ứng
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
exports.startSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    const sprint = await Sprint.findById(id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Sprint!' });
    }

    // Kiểm tra xem đã có Sprint nào đang Active trong dự án này chưa
    const activeSprint = await Sprint.findOne({
      projectId: sprint.projectId,
      status: 'active',
      _id: { $ne: id }
    });

    if (activeSprint) {
      return res.status(400).json({
        success: false,
        message: `Sprint "${activeSprint.name}" đang diễn ra. Mỗi dự án chỉ được phép có 1 Sprint active tại một thời điểm!`
      });
    }

    sprint.status = 'active';
    sprint.startDate = startDate || new Date();
    sprint.endDate = endDate || sprint.endDate;
    await sprint.save();

    res.status(200).json({ success: true, message: 'Đã kích hoạt Sprint thành công!', data: sprint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hoàn thành Sprint (Complete Sprint) - Tự động đẩy Task chưa DONE về Backlog
// @route   PUT /api/sprints/:id/complete
exports.completeSprint = async (req, res) => {
  try {
    const { id } = req.params;

    const sprint = await Sprint.findById(id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Sprint!' });
    }

    // 1. Cập nhật trạng thái Sprint thành 'completed'
    sprint.status = 'completed';
    await sprint.save();

    // 2. Trả tất cả Task trong Sprint chưa ở trạng thái 'done' (hoặc 'DONE') về Product Backlog (sprintId = null)
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

// @desc    Cập nhật thông tin Sprint (Tên, Goal, Ngày bắt đầu/kết thúc)
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

// @desc    Xóa Sprint (Các task thuộc Sprint này sẽ được đưa về lại Backlog thay vì bị xóa)
// @route   DELETE /api/sprints/:id
exports.deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Sprint!' });
    }

    // Đẩy toàn bộ task thuộc sprint này về Product Backlog
    await Task.updateMany({ sprintId: req.params.id }, { $set: { sprintId: null } });

    res.status(200).json({ success: true, message: 'Đã xóa Sprint và chuyển các Task về Backlog thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};