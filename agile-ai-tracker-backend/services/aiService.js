const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.parseDailyReportWithAI = async (rawReportText) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Bạn là Trợ lý AI Quản trị dự án Agile/Scrum. Hãy phân tích báo cáo Daily Standup và trả về định dạng JSON thuần túy.',
        },
        {
          role: 'user',
          content: `
Bạn là Trợ lý AI Quản trị dự án Agile/Scrum chuyên nghiệp.
Nhiệm vụ của bạn là phân tích đoạn báo cáo tiến độ Daily Standup của Lập trình viên và trích xuất dữ liệu thành định dạng JSON.

Đoạn báo cáo thô của Lập trình viên:
"""
${rawReportText}
"""

Yêu cầu cấu trúc JSON đầu ra:
{
  "yesterdayDone": ["Danh sách các việc đã làm xong ngày hôm qua"],
  "todayPlan": ["Danh sách các việc dự định làm hôm nay"],
  "blockers": ["Danh sách các khó khăn, lỗi kẹt, vấn đề đang gặp phải (nếu có)"],
  "isBlocked": true/false (Đặt true nếu trong báo cáo có đề cập khó khăn/bế tắc/lỗi kẹt, ngược lại là false),
  "summary": "Tóm tắt ngắn gọn 1 câu về tình hình công việc hiện tại của thành viên này"
}
          `,
        },
      ],
      model: 'llama-3.3-70b-versatile', // Mô hình siêu mạnh & hoàn toàn miễn phí
      response_format: { type: 'json_object' }, // Bắt buộc trả về JSON
    });

    const responseText = completion.choices[0]?.message?.content;
    return JSON.parse(responseText);

  } catch (error) {
    console.error('Lỗi khi xử lý AI:', error.message);
    return {
      yesterdayDone: [rawReportText],
      todayPlan: [],
      blockers: [],
      isBlocked: false,
      summary: 'Không thể phân tích bằng AI, lưu báo cáo gốc.',
    };
  }
};