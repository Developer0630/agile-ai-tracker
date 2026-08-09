const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['DEV', 'TESTER', 'PM', 'SCRUM_MASTER'], default: 'DEV' },
  skills: [{ type: String }], // Ví dụ: ['ReactJS', 'NodeJS', 'MongoDB'] - AI dựa vào đây để gợi ý task
  maxWipLimit: { type: Number, default: 3 }, // Giới hạn số task đang làm cùng lúc
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);