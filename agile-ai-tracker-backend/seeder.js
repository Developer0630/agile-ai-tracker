const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load biến môi trường từ file .env
dotenv.config();

// Import các Models
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

// Kết nối CSDL MongoDB Atlas
mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  try {
    // 1. Dọn dẹp dữ liệu cũ (nếu có)
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();

    console.log('🧹 Đã xóa sạch dữ liệu cũ trên Cloud DB...');

    // 2. Tạo danh sách 3 Nhân sự mẫu
    const users = await User.insertMany([
      { 
        name: 'Nguyễn Văn A (PM)', 
        email: 'pm@vku.udn.vn', 
        role: 'PM', 
        skills: ['Agile/Scrum', 'Project Management', 'System Design'] 
      },
      { 
        name: 'Trần Thị B (Dev Frontend)', 
        email: 'dev1@vku.udn.vn', 
        role: 'DEV', 
        skills: ['ReactJS', 'TailwindCSS', 'JavaScript', 'UI/UX'] 
      },
      { 
        name: 'Lê Văn C (Dev Backend)', 
        email: 'dev2@vku.udn.vn', 
        role: 'DEV', 
        skills: ['NodeJS', 'Express', 'MongoDB', 'RESTful API'] 
      }
    ]);

    console.log('👤 Đã tạo thành công 3 Tài khoản mẫu!');

    // 3. Tạo 1 Dự án mẫu
    const project = await Project.create({
      name: 'Hệ thống Trợ lý AI Agile Tracker VKU',
      key: 'VKU-AI',
      description: 'Dự án thực tập thực tế tối ưu quy trình Agile bằng AI',
      pmId: users[0]._id,
      members: [users[0]._id, users[1]._id, users[2]._id]
    });

    console.log(`📁 Đã khởi tạo Dự án: ${project.name} (${project.key})`);

    // 4. Tạo các Tasks mẫu cho bảng Kanban (TODO, IN_PROGRESS, DONE)
    await Task.insertMany([
      {
        title: 'Thiết kế giao diện bảng Kanban bằng ReactJS',
        description: 'Sử dụng TailwindCSS dựng layout 4 cột TODO, IN_PROGRESS, REVIEW, DONE',
        projectId: project._id,
        assigneeId: users[1]._id, // Giao cho Dev Frontend
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        tags: ['Frontend', 'UI/UX']
      },
      {
        title: 'Xây dựng API tích hợp Gemini AI cho Daily Standup',
        description: 'Sử dụng SDK Gemini để phân tích ngữ nghĩa báo cáo văn bản của Dev',
        projectId: project._id,
        assigneeId: users[2]._id, // Giao cho Dev Backend
        status: 'TODO',
        priority: 'URGENT',
        tags: ['Backend', 'AI', 'API']
      },
      {
        title: 'Thiết kế Sơ đồ Cơ sở dữ liệu MongoDB Atlas',
        description: 'Tạo các Schema User, Project, Task, DailyReport',
        projectId: project._id,
        assigneeId: users[2]._id, // Giao cho Dev Backend
        status: 'DONE',
        priority: 'MEDIUM',
        tags: ['Database', 'Architecture']
      }
    ]);

    console.log('📋 Đã tạo 3 Tasks mẫu trên bảng Kanban!');
    console.log('✅ KHỞI TẠO DỮ LIỆU CSDƯ LÝ LÊN CLOUD THÀNH CÔNG!');
    process.exit();
  } catch (error) {
    console.error(`❌ Lỗi khi bơm dữ liệu: ${error.message}`);
    process.exit(1);
  }
};

seedData();