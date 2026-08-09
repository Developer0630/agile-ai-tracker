const DailyReport = require('../models/DailyReport');
const Task = require('../models/Task');
const { parseDailyReportWithAI } = require('../services/aiService');

// @desc    Gửi báo cáo Daily Standup (Tự động phân tích bằng AI)
// @route   POST /api/daily
exports.submitDailyReport = async (req, res) => {
  try {
    const { projectId, userId, rawContent, taskId } = req.body;

    if (!rawContent) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung báo cáo!' });
    }

    // 1. Gọi Module AI phân tích văn bản thô
    const aiParsed = await parseDailyReportWithAI(rawContent);

    // 2. Lưu kết quả vào CSDL
    const report = await DailyReport.create({
      projectId,
      userId,
      rawContent,
      aiParsed: {
        yesterdayDone: aiParsed.yesterdayDone,
        todayPlan: aiParsed.todayPlan,
        blockers: aiParsed.blockers
      }
    });

    // 3. Nếu AI phát hiện có Blocker và có truyền taskId -> Cập nhật cảnh báo đỏ lên Task đó
    if (aiParsed.isBlocked && taskId) {
      await Task.findByIdAndUpdate(taskId, {
        isBlocked: true,
        blockerReason: aiParsed.blockers.join(', ') || 'Đang gặp bế tắc kỹ thuật'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Đã phân tích báo cáo bằng AI thành công!',
      data: {
        report,
        aiAnalysis: aiParsed
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};