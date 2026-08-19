const Project = require('../models/Project');

// Middleware 1: Kiểm tra xem User có thuộc về dự án hay không (áp dụng cho xem Project, xem Task, Board, Summary, Docs)
exports.canAccessProject = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId || req.query.projectId;
    const userId = (req.user.id || req.user._id).toString();

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án!' });
    }

    // 1. Nếu là Owner -> Toàn quyền
    if (project.owner && project.owner.toString() === userId) {
      req.userRole = 'OWNER';
      return next();
    }

    // 2. Tìm trong danh sách members
    const member = project.members.find(
      m => m.user && m.user.toString() === userId
    );

    if (!member) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không phải là thành viên của dự án này!' 
      });
    }

    // Gán role vào request để controller/frontend tiện sử dụng (ADMIN, PM, MEMBER, VIEWER)
    req.userRole = member.role;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Middleware 2: Kiểm tra quyền quản trị cụ thể (áp dụng cho xóa task, cấu hình, quản lý thành viên)
exports.requireProjectRole = (allowedRoles = ['ADMIN', 'PM']) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.body.projectId || req.query.projectId;
      const userId = (req.user.id || req.user._id).toString();

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy dự án!' });
      }

      if (project.owner && project.owner.toString() === userId) {
        req.userRole = 'OWNER';
        return next();
      }

      const member = project.members.find(
        m => m.user && m.user.toString() === userId
      );

      if (!member || !allowedRoles.includes(member.role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Bạn không có quyền thực hiện thao tác quản lý này!' 
        });
      }

      req.userRole = member.role;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
};