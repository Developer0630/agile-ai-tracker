const { GoogleGenAI } = require('@google/genai');
const Task = require('../models/Task');
const Sprint = require('../models/Sprint');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.parseNaturalLanguageTask = async (req, res) => {
  try {
    const { prompt, projectId } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung prompt!' });
    }

    const activeSprint = await Sprint.findOne({ projectId, status: 'ACTIVE' });
    const sprints = await Sprint.find({ projectId }).select('name _id');

    const systemInstruction = `
      Bạn là một Trợ lý Quản lý Dự án Agile thông minh. Nhiệm vụ của bạn là phân tích đoạn văn bản yêu cầu công việc bằng tiếng Việt và trích xuất thành cấu trúc JSON chuẩn sau:
      {
        "title": "Tiêu đề ngắn gọn của task",
        "description": "Mô tả chi tiết nếu có",
        "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        "dueDate": "YYYY-MM-DD hoặc null nếu không có",
        "target": "ACTIVE_SPRINT" | "BACKLOG"
      }
      Hiện tại dự án có các Sprint: ${JSON.stringify(sprints)}. Nếu người dùng giao làm ngay hoặc nhắc đến sprint, chọn "ACTIVE_SPRINT", ngược lại "BACKLOG".
      Chỉ trả về JSON thuần túy, không kèm markdown code block (như \`\`\`json).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    let rawText = (response.text || '').trim();
    // Làm sạch nếu AI lỡ trả về markdown code blocks
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(rawText);

    const newTask = await Task.create({
      projectId,
      title: parsedData.title || prompt,
      description: parsedData.description || '',
      priority: parsedData.priority || 'MEDIUM',
      dueDate: parsedData.dueDate ? new Date(parsedData.dueDate) : null,
      sprintId: parsedData.target === 'ACTIVE_SPRINT' && activeSprint ? activeSprint._id : null,
      status: 'TODO'
    });

    res.status(201).json({
      success: true,
      message: 'AI đã tạo task thành công!',
      data: newTask
    });

  } catch (error) {
    console.error('Lỗi chi tiết tại AI Parser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Thêm hàm AI chia nhỏ task
exports.breakdownTaskWithAI = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy task!' });
    }

    const systemInstruction = `
      Bạn là một Trợ lý Quản lý Dự án Agile chuyên nghiệp. Nhiệm vụ của bạn là đọc tiêu đề và mô tả của công việc sau đây, sau đó chia nhỏ nó thành một danh sách từ 3 đến 5 công việc con (subtasks) cụ thể, thực tế bằng tiếng Việt.
      Chỉ trả về định dạng JSON thuần túy là một mảng các chuỗi (string) tiêu đề subtask, không kèm markdown hoặc giải thích nào khác.
      Ví dụ: ["Thiết kế cơ sở dữ liệu", "Viết API endpoint", "Kiểm thử unit test"]
    `;

    const prompt = `Công việc cần chia nhỏ: Tiêu đề: "${task.title}". Mô tả: "${task.description || 'Không có'}".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    let rawText = (response.text || '').trim();
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const subtaskTitles = JSON.parse(rawText);

    // Thêm các subtask mới vào task hiện tại
    const newSubtasks = subtaskTitles.map(title => ({ title, completed: false }));
    task.subtasks.push(...newSubtasks);
    await task.save();

    res.status(200).json({
      success: true,
      message: 'AI đã chia nhỏ công việc thành công!',
      data: task
    });

  } catch (error) {
    console.error('Lỗi AI Task Breakdown:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};