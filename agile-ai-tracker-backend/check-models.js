require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listAvailableModels() {
  try {
    const response = await ai.models.list();
    // In toàn bộ cấu trúc để xem mảng model nằm ở đâu
    console.log("Cấu trúc response:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách model:", error);
  }
}

listAvailableModels();