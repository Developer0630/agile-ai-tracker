const SystemSetting = require('../models/SystemSetting');
const User = require('../models/User');
const Project = require('../models/Project');
const bcrypt = require('bcryptjs');
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
    model: 'gemini-3.5-flash',
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

    const user = await User.findByIdAndUpdate(
      userId,
      { ...(role && { role }), ...(name && { name }) },
      { new: true }
    ).select('-password');

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

    await User.findByIdAndDelete(userId);
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
    await Project.findByIdAndDelete(projectId);
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

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-password');

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

    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: `Đã đặt lại mật khẩu cho tài khoản thành: ${newPassword}`
    });
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
    const [totalUsers, totalProjects] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProjects
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};