exports.requireSystemAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Truy cập bị từ chối! Bạn cần quyền Quản trị viên hệ thống (System Admin).'
  });
};