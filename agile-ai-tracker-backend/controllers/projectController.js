const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');

// 1. Lấy danh sách dự án của User (Hỗ trợ cả Schema cũ & mới)
exports.getUserProjects = async (req, res) => {
  try {
    const rawUserId = req.user.id || req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(rawUserId);

    const projects = await Project.find({
      $or: [
        { owner: userObjectId },
        { 'members.user': userObjectId },
        { members: userObjectId } // Hỗ trợ dữ liệu mảng ObjectId cũ
      ]
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error('Lỗi getUserProjects:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Tạo dự án mới (Chuẩn hóa toàn bộ members thành Object { user, role })
exports.createProject = async (req, res) => {
  try {
    const { name, key, description, memberIds = [] } = req.body;
    const currentUserId = req.user.id || req.user._id;
    const projectKey = key ? key.toUpperCase() : (name.substring(0, 3).toUpperCase() || 'FJR');

    // Gom toàn bộ thành viên, loại bỏ trùng lặp và gán role chuẩn
    const memberMap = new Map();
    memberMap.set(currentUserId.toString(), { user: currentUserId, role: 'ADMIN' });

    memberIds.forEach(id => {
      if (id && id.toString() !== currentUserId.toString()) {
        memberMap.set(id.toString(), { user: id, role: 'MEMBER' });
      }
    });

    const newProject = await Project.create({
      name,
      key: projectKey,
      description: description || '',
      owner: currentUserId,
      members: Array.from(memberMap.values())
    });

    const populatedProject = await Project.findById(newProject._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({ success: true, data: populatedProject });
  } catch (error) {
    console.error('Lỗi createProject:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 3. Lấy danh sách thành viên (Tự động fallback nếu dữ liệu cũ chưa có key user)
exports.getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('members', 'name email avatar'); // Hỗ trợ fallback populate thẳng nếu là mảng User ID cũ

    if (!project) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án!' });
    }

    // Chuẩn hóa dữ liệu trả về Frontend
    const formattedMembers = (project.members || []).map(m => {
      // Trường hợp 1: Chuẩn Schema mới { user: { name, email }, role: '...' }
      if (m.user && typeof m.user === 'object') {
        return {
          _id: m._id,
          role: m.role || 'MEMBER',
          user: m.user
        };
      }
      // Trường hợp 2: Dữ liệu cũ populate trực tiếp vào m { _id, name, email }
      if (m.email) {
        return {
          _id: m._id,
          role: 'MEMBER',
          user: { _id: m._id, name: m.name, email: m.email, avatar: m.avatar }
        };
      }
      return m;
    }).filter(m => m && m.user && (m.user.email || m.user.name));

    // Đảm bảo luôn có Owner trong danh sách
    if (project.owner && !formattedMembers.some(m => m.user._id.toString() === project.owner._id.toString())) {
      formattedMembers.unshift({
        _id: project.owner._id,
        role: 'ADMIN',
        user: project.owner
      });
    }

    return res.status(200).json({ success: true, data: formattedMembers });
  } catch (error) {
    console.error('Lỗi getProjectMembers:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Thêm thành viên theo Email
exports.addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role = 'MEMBER' } = req.body;

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng với email này!' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án!' });
    }

    // Kiểm tra xem user đã tồn tại trong members chưa (hỗ trợ cả 2 dạng dữ liệu)
    const isAlreadyMember = (project.members || []).some(m => {
      const existingId = m?.user?._id || m?.user || m;
      return existingId && existingId.toString() === userToAdd._id.toString();
    });

    if (isAlreadyMember) {
      return res.status(400).json({ success: false, message: 'Người dùng đã có trong dự án!' });
    }

    // Nếu dự án cũ bị thiếu key, tự bù key luôn
    const updatePayload = {
      $push: { members: { user: userToAdd._id, role, joinedAt: new Date() } }
    };
    if (!project.key) {
      updatePayload.$set = { key: (project.name || 'FJR').substring(0, 3).toUpperCase() };
    }

    // Cập nhật nguyên tử với findByIdAndUpdate để tránh validate conflict dữ liệu cũ
    await Project.findByIdAndUpdate(projectId, updatePayload);

    // Trả về danh sách thành viên mới sau khi populate
    const updatedProject = await Project.findById(projectId)
      .populate('members.user', 'name email avatar');

    res.status(200).json({ success: true, data: updatedProject.members });
  } catch (error) {
    console.error('Lỗi addMember:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Đổi quyền thành viên
// Cập nhật vai trò thành viên
exports.updateMemberRole = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;

    await Project.updateOne(
      { _id: projectId, "members._id": memberId },
      { $set: { "members.$.role": role } }
    );

    res.status(200).json({ success: true, message: 'Cập nhật quyền thành công!' });
  } catch (error) {
    console.error('Lỗi updateMemberRole:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa thành viên khỏi dự án
exports.removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    await Project.findByIdAndUpdate(projectId, {
      $pull: { members: { _id: memberId } }
    });

    res.status(200).json({ success: true, message: 'Đã xóa thành viên khỏi dự án!' });
  } catch (error) {
    console.error('Lỗi removeMember:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};