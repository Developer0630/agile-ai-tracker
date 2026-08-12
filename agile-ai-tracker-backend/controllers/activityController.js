const Activity = require('../models/Activity');

exports.logActivity = async (taskId, userId, action, content) => {
  try {
    await Activity.create({
      taskId,
      userId,
      action,
      content,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Lỗi ghi log activity:", error);
  }
};
