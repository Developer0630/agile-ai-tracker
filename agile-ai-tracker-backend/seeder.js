const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('./models/User');
const Project = require('./models/Project');
const Sprint = require('./models/Sprint');
const Task = require('./models/Task');
const DailyReport = require('./models/DailyReport');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fjra-tracker';

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Kết nối MongoDB thành công!');

    // 1. XÓA SẠCH DỮ LIỆU CŨ TRONG CÁC COLLECTION
    await User.deleteMany({});
    await Project.deleteMany({});
    await Sprint.deleteMany({});
    await Task.deleteMany({});
    await DailyReport.deleteMany({});
    console.log('🧹 Đã xóa sạch toàn bộ dữ liệu cũ!');

    // 2. TẠO USERS MẪU (BỔ SUNG PHẦN THIẾU)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const pm = await User.create({
      name: 'Nguyễn Văn PM',
      email: 'pm@fjra.io',
      password: hashedPassword,
      role: 'PM'
    });

    const dev1 = await User.create({
      name: 'Trần Dev One',
      email: 'dev1@fjra.io',
      password: hashedPassword,
      role: 'MEMBER'
    });

    const dev2 = await User.create({
      name: 'Lê Dev Two',
      email: 'dev2@fjra.io',
      password: hashedPassword,
      role: 'MEMBER'
    });

    console.log('👤 Đã tạo 3 Users mẫu (Mật khẩu chung: 123456)');

    // 3. TẠO PROJECT MẪU
    const project = await Project.create({
      name: 'Dự án Quản lý FJra 2026',
      description: 'Hệ thống Quản lý Agile tích hợp Trợ lý Gemini AI cho Daily Standup',
      owner: pm._id, // Cập nhật từ pmId thành owner để trùng khớp Schema
      members: [pm._id, dev1._id, dev2._id] // Thêm cả PM vào members để PM cũng xem được dự án
    });

    console.log(`📁 Đã tạo Project mẫu: ${project.name} (ID: ${project._id})`);

    // 4. TẠO SPRINT MẪU (Sử dụng chữ viết thường cho status: 'active', 'planned')
    const sprint1 = await Sprint.create({
      projectId: project._id,
      name: 'Sprint 1 - Thiết kế UI & Base API',
      goal: 'Hoàn thiện giao diện bảng Kanban và kết nối API công việc',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 tuần
      status: 'active' // Chuyển từ 'ACTIVE' -> 'active'
    });

    const sprint2 = await Sprint.create({
      projectId: project._id,
      name: 'Sprint 2 - Tích hợp AI Standup',
      goal: 'Tự động phân tích báo cáo hằng ngày bằng Gemini API',
      status: 'planned' // Chuyển từ 'PLANNED' -> 'planned'
    });

    console.log('🏃‍♂️ Đã tạo 2 Sprint (1 Active, 1 Planned)!');

    // 5. TẠO TASK MẪU
    await Task.create([
      // Task thuộc Sprint 1 (Active)
      {
        title: 'Thiết kế giao diện bảng Kanban bằng ReactJS',
        description: 'Xây dựng giao diện kéo thả sử dụng @hello-pangea/dnd',
        projectId: project._id,
        sprintId: sprint1._id,
        assigneeId: dev1._id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        tags: ['Frontend', 'ReactJS']
      },
      {
        title: 'Thiết kế Sơ đồ Cơ sở dữ liệu MongoDB Atlas',
        description: 'Tạo các Model Mongoose cho Task, Sprint, Project và User',
        projectId: project._id,
        sprintId: sprint1._id,
        assigneeId: dev2._id,
        status: 'DONE',
        priority: 'MEDIUM',
        tags: ['Backend', 'Database']
      },

      // Task thuộc Product Backlog (sprintId = null)
      {
        title: 'Xây dựng API tích hợp Gemini AI cho Daily Standup',
        description: 'Xử lý parse báo cáo thô thành json yesterdayDone, todayPlan, blockers',
        projectId: project._id,
        sprintId: null,
        assigneeId: dev2._id,
        status: 'TODO',
        priority: 'URGENT',
        tags: ['AI', 'NodeJS']
      },
      {
        title: 'Thiết kế giao diện Đăng nhập / Đăng ký',
        description: 'Hỗ trợ JWT và lưu thông tin phiên làm việc',
        projectId: project._id,
        sprintId: null,
        status: 'TODO',
        priority: 'LOW',
        tags: ['Frontend']
      },
      {
        title: 'Tối ưu hóa hiệu năng render danh sách Task',
        description: 'Sử dụng React memo hóa các component TaskItem',
        projectId: project._id,
        sprintId: null,
        status: 'TODO',
        priority: 'LOW',
        tags: ['Optimization']
      }
    ]);

    console.log('📋 Đã tạo 5 Task mẫu (2 Task trong Sprint 1, 3 Task trong Backlog)!');

    console.log('----------------------------------------------------');
    console.log('🎉 KHỞI TẠO DỮ LIỆU MẪU THÀNH CÔNG!');
    console.log(`👉 Đăng nhập PM: pm@fjra.io | Pass: 123456`);
    console.log(`👉 Đăng nhập Dev: dev1@fjra.io | Pass: 123456`);
    console.log(`👉 Project ID: ${project._id}`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi trong quá trình tạo dữ liệu mẫu:', error);
    process.exit(1);
  }
}

seedData();