const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fjra_secret_key');
      const currentUser = await User.findById(decoded.id).select('-password');
      
      if (!currentUser) {
        return res.status(401).json({ success: false, message: 'Người dùng sở hữu Token này không còn tồn tại!' });
      }

      if (currentUser.status === 'SUSPENDED') {
        return res.status(403).json({ 
          success: false, 
          message: 'Tài khoản của bạn đã bị tạm khóa. Bạn bị từ chối truy cập!' 
        });
      }
      req.user = currentUser;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Không tìm thấy Token xác thực' });
  }
};

module.exports = { protect };