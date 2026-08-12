const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // Ví dụ: "đã cập nhật trạng thái", "đã bình luận"
  content: String, // Nội dung chi tiết (ví dụ: "TODO sang IN_PROGRESS")
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);