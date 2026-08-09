const mongoose = require('mongoose');

const DailyReportSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rawContent: { type: String, required: true }, // Văn bản thô do Dev gõ hoặc nói
  aiParsed: {
    yesterdayDone: [{ type: String }],
    todayPlan: [{ type: String }],
    blockers: [{ type: String }]
  },
  reportDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DailyReport', DailyReportSchema);