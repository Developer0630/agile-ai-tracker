const SystemSetting = require('../models/SystemSetting');
const User = require('../models/User');
const Project = require('../models/Project');
const bcrypt = require('bcryptjs');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../utils/auditLogger');
const Task = require('../models/Task');
const mongoose = require('mongoose');
// Giá trị mặc định nếu database chưa có
const DEFAULT_SETTINGS = {
  task_priorities: [
    { key: 'LOW', label: 'Thấp', color: '#10B981' },
    { key: 'MEDIUM', label: 'Trung bình', color: '#3B82F6' },
    { key: 'HIGH', label: 'Cao', color: '#F59E0B' },
    { key: 'URGENT', label: 'Khẩn cấp', color: '#EF4444' }
  ],
  task_statuses: [
    { key: 'TODO', label: 'Cần làm', isDefault: true },
    { key: 'IN_PROGRESS', label: 'Đang làm', isDefault: false },
    { key: 'DONE', label: 'Hoàn thành', isDefault: false }
  ],
  ai_config: {
    model: 'gemini-2.5-flash',
    dailyQuotaPerUser: 20,
    enableAutoBreakdown: true
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, name } = req.body;

    // 1. Cập nhật User trước
    const user = await User.findByIdAndUpdate(
      userId,
      { ...(role && { role }), ...(name && { name }) },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
    }

    // 2. Ghi Audit Log sau khi đã có thông tin user
    try {
      await logAudit({
        actorId: req.user.id || req.user._id,
        action: 'USER_ROLE_CHANGED',
        targetType: 'USER',
        targetId: userId,
        details: `Đổi vai trò hệ thống của ${user.name} thành [${role || user.role}]`,
        req
      });
    } catch (logErr) {
      console.warn('Lỗi ghi audit log:', logErr.message);
    }

    res.status(200).json({ success: true, message: 'Cập nhật tài khoản thành công!', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'Không thể tự xóa chính tài khoản Admin đang đăng nhập!' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng cần xóa!' });
    }

    try {
      await logAudit({
        actorId: req.user.id || req.user._id,
        action: 'USER_DELETED',
        targetType: 'USER',
        targetId: userId,
        details: `Xóa vĩnh viễn người dùng ${deletedUser.name} (${deletedUser.email})`,
        req
      });
    } catch (logErr) {
      console.warn('Lỗi ghi audit log:', logErr.message);
    }

    res.status(200).json({ success: true, message: 'Đã xóa người dùng khỏi hệ thống!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProjectByAdmin = async (req, res) => {
  try {
    const { projectId } = req.params;
    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án cần xóa!' });
    }

    try {
      await logAudit({
        actorId: req.user.id || req.user._id,
        action: 'PROJECT_DELETED',
        targetType: 'PROJECT',
        targetId: projectId,
        details: `Xóa vĩnh viễn dự án "${deletedProject.name}" (Key: ${deletedProject.key})`,
        req
      });
    } catch (logErr) {
      console.warn('Lỗi ghi audit log:', logErr.message);
    }

    res.status(200).json({ success: true, message: 'Admin đã xóa dự án thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'ACTIVE' | 'SUSPENDED'

    if (userId === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự khóa tài khoản của chính mình!' });
    }

    // 1. Cập nhật User trước
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
    }

    // 2. Ghi Audit Log sau khi updatedUser đã tồn tại
    try {
      await logAudit({
        actorId: req.user.id || req.user._id,
        action: status === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
        targetType: 'USER',
        targetId: userId,
        details: `Quản trị viên đã ${status === 'SUSPENDED' ? 'khóa' : 'mở khóa'} tài khoản của ${updatedUser.name} (${updatedUser.email})`,
        req
      });
    } catch (logErr) {
      console.warn('Lỗi ghi audit log:', logErr.message);
    }

    res.status(200).json({
      success: true,
      message: status === 'SUSPENDED' ? 'Đã tạm khóa tài khoản!' : 'Đã kích hoạt lại tài khoản!',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.transferProjectOwner = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { newOwnerId } = req.body;

    const newOwner = await User.findById(newOwnerId);
    if (!newOwner) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng mới để chuyển giao!' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án!' });
    }

    project.owner = newOwnerId;

    // Đảm bảo Owner mới có quyền ADMIN trong danh sách members
    const memberIndex = project.members.findIndex(
      m => (m.user?._id || m.user || m).toString() === newOwnerId.toString()
    );

    if (memberIndex !== -1) {
      project.members[memberIndex].role = 'ADMIN';
    } else {
      project.members.push({ user: newOwnerId, role: 'ADMIN' });
    }

    await project.save();

    const updated = await Project.findById(projectId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    try {
      await logAudit({
        actorId: req.user.id || req.user._id,
        action: 'PROJECT_OWNERSHIP_TRANSFERRED',
        targetType: 'PROJECT',
        targetId: projectId,
        details: `Chuyển quyền sở hữu dự án "${project.name}" cho ${newOwner.name}`,
        req
      });
    } catch (logErr) {
      console.warn('Lỗi ghi audit log:', logErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Đã chuyển giao quyền sở hữu dự án cho ${newOwner.name}!`,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword = 'FJra@123456' } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findByIdAndUpdate(userId, { password: hashedPassword });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' });
    }

    try {
      await logAudit({
        actorId: req.user.id || req.user._id,
        action: 'USER_PASSWORD_RESET',
        targetType: 'USER',
        targetId: userId,
        details: `Đặt lại mật khẩu cho tài khoản ${user.name} (${user.email})`,
        req
      });
    } catch (logErr) {
      console.warn('Lỗi ghi audit log:', logErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Đã đặt lại mật khẩu cho tài khoản thành: ${newPassword}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('actor', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.find();
    const result = { ...DEFAULT_SETTINGS };

    settings.forEach(s => {
      result[s.key] = s.value;
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    const userId = req.user.id || req.user._id;

    const updated = await SystemSetting.findOneAndUpdate(
      { key },
      { value, description, updatedBy: userId },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: `Đã lưu cài đặt [${key}]`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    const startTime = Date.now();

    // 1. Kiểm tra Ping Database
    let dbStatus = 'CONNECTED';
    let dbLatency = 0;
    try {
      await mongoose.connection.db.admin().ping();
      dbLatency = Date.now() - startTime;
    } catch {
      dbStatus = 'DISCONNECTED';
    }

    // 2. Thống kê Users, Projects và Tasks
    const [totalUsers, activeUsers, suspendedUsers, totalProjects, taskStats] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ status: 'SUSPENDED' }),
      Project.countDocuments(),
      Task.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Chuẩn hóa phân bổ task theo status
    const taskBreakdown = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
      total: 0
    };

    taskStats.forEach(item => {
      if (item._id && taskBreakdown.hasOwnProperty(item._id)) {
        taskBreakdown[item._id] = item.count;
      }
      taskBreakdown.total += item.count;
    });

    // 3. Thông tin tài nguyên Node.js server
    const memoryUsage = process.memoryUsage();
    const serverUptimeSeconds = Math.floor(process.uptime());

    res.status(200).json({
      success: true,
      data: {
        database: {
          status: dbStatus,
          latencyMs: dbLatency
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers
        },
        projects: {
          total: totalProjects
        },
        tasks: taskBreakdown,
        server: {
          uptime: serverUptimeSeconds,
          heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};