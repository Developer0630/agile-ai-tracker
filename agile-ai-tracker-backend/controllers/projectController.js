const Project = require('../models/Project');

// Lấy danh sách dự án thuộc về User đang đăng nhập
exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ token qua middleware protect

    // Tìm các dự án do User làm Owner HOẶC nằm trong mảng Members
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    }).populate('owner', 'name email')
      .populate('members', 'name email role');

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Tạo dự án mới (Tự động gán user hiện tại làm Owner)
exports.createProject = async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const currentUserId = req.user.id;

    // Đảm bảo người tạo dự án (Owner) luôn tự động nằm trong danh sách members
    const allMembers = Array.from(new Set([currentUserId, ...(memberIds || [])]));

    const newProject = await Project.create({
      name,
      description,
      owner: currentUserId,
      members: allMembers
    });

    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};