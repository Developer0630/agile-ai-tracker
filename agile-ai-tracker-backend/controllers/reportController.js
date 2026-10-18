const Task = require('../models/Task');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getRoleBasedReport = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role; // 'ADMIN' | 'PM' | 'MEMBER'
    const { projectId } = req.query; // Tùy chọn truyền projectId nếu đang ở trong dự án cụ thể

    const now = new Date();

    // ==========================================
    // 1. DÀNH CHO ROLE ADMIN (BÁO CÁO TOÀN CỤC)
    // ==========================================
    if (userRole === 'ADMIN' && !projectId) {
      const [totalProjects, totalTasks, overdueTasks, doneTasks, activeSprints] = await Promise.all([
        Project.countDocuments(),
        Task.countDocuments(),
        Task.countDocuments({ status: { $ne: 'DONE' }, dueDate: {$lt: now } }),
        Task.countDocuments({ status: 'DONE' }),
        Sprint.countDocuments({ status: 'ACTIVE' })
      ]);

      const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      return res.status(200).json({
        success: true,
        role: 'ADMIN',
        data: {
          title: 'Báo Cáo Tổng Thể Toàn Bộ Không Gian Làm Việc',
          metrics: {
            totalProjects,
            activeSprints,
            totalTasks,
            doneTasks,
            overdueTasks,
            completionRate: `${completionRate}%`
          },
          summary: `Hệ thống đang chạy ${activeSprints} Sprint trên ${totalProjects} dự án. Tỷ lệ hoàn thành công việc đạt ${completionRate}%. Hiện có ${overdueTasks} công việc quá hạn cần PM rà soát.`
        }
      });
    }

    // ==========================================
    // 2. DÀNH CHO ROLE PM (QUẢN LÝ DỰ ÁN CỤ THỂ)
    // ==========================================
    if (userRole === 'PM' || (userRole === 'ADMIN' && projectId)) {
      if (!projectId) {
        return res.status(400).json({ success: false, message: 'PM cần chọn dự án cụ thể để xem báo cáo!' });
      }

      const projectObjectId = new mongoose.Types.ObjectId(projectId);

      // Lấy Sprint đang chạy
      const activeSprint = await Sprint.findOne({ projectId: projectObjectId, status: 'ACTIVE' });

      // Lấy tất cả task trong dự án (hoặc trong sprint active)
      const tasks = await Task.find({ projectId: projectObjectId }).populate('assigneeId', 'name email');

      const total = tasks.length;
      const todo = tasks.filter(t => t.status === 'TODO').length;
      const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const done = tasks.filter(t => t.status === 'DONE').length;
      const overdue = tasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now).length;

      // Phân bổ tải công việc theo từng thành viên (Workload Distribution)
      const memberWorkload = {};
      tasks.forEach(t => {
        const name = t.assigneeId?.name || 'Chưa gán';
        if (!memberWorkload[name]) {
          memberWorkload[name] = { total: 0, done: 0, pending: 0 };
        }
        memberWorkload[name].total += 1;
        if (t.status === 'DONE') memberWorkload[name].done += 1;
        else memberWorkload[name].pending += 1;
      });

      return res.status(200).json({
        success: true,
        role: 'PM',
        data: {
          title: `Báo Cáo Tiến Độ Dự Án`,
          activeSprintName: activeSprint ? activeSprint.name : 'Chưa có Sprint kích hoạt',
          taskOverview: { total, todo, inProgress, done, overdue },
          completionRate: total > 0 ? `${Math.round((done / total) * 100)}%` : '0%',
          workload: memberWorkload,
          summary: activeSprint 
            ? `Sprint "${activeSprint.name}" đang thực hiện: ${done}/${total} task hoàn thành (${Math.round((done / (total || 1)) * 100)}%). Cần giải quyết ${overdue} task quá hạn.`
            : `Dự án chưa kích hoạt Sprint. Tổng cộng có ${total} task trên Backlog.`
        }
      });
    }

    // ==========================================
    // 3. DÀNH CHO ROLE MEMBER (BÁO CÁO NĂNG SUẤT CÁ NHÂN)
    // ==========================================
    const myTasks = await Task.find({ assigneeId: userId });
    const myTotal = myTasks.length;
    const myDone = myTasks.filter(t => t.status === 'DONE').length;
    const myInProgress = myTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const myTodo = myTasks.filter(t => t.status === 'TODO').length;
    const myOverdue = myTasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now);

    return res.status(200).json({
      success: true,
      role: 'MEMBER',
      data: {
        title: 'Báo Cáo Năng Suất & Trách Nhiệm Cá Nhân',
        overview: {
          total: myTotal,
          done: myDone,
          inProgress: myInProgress,
          todo: myTodo,
          overdueCount: myOverdue.length,
          completionRate: myTotal > 0 ? `${Math.round((myDone / myTotal) * 100)}%` : '0%'
        },
        overdueTasks: myOverdue.map(t => ({
          id: t._id,
          title: t.title,
          dueDate: t.dueDate,
          priority: t.priority
        })),
        summary: myOverdue.length > 0
          ? `Bạn đã hoàn thành ${myDone}/${myTotal} task. Chú ý: bạn đang có ${myOverdue.length} việc quá hạn cần ưu tiên xử lý ngay!`
          : `Bạn đang duy trì tiến độ tốt (${myDone}/${myTotal} task hoàn thành). Không có công việc nào bị trễ hạn.`
      }
    });

  } catch (error) {
    console.error('Lỗi sinh báo cáo:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};