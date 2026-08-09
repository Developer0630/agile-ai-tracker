const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, uppercase: true }, // Ví dụ: VKU-2026
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pmId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);