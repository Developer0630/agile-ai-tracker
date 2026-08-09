require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }, { apiVersion: 'v1beta' });
    const res = await model.generateContent('Hello');
    console.log('✅ AI Hoạt động bình thường:', res.response.text());
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  }
}

test();