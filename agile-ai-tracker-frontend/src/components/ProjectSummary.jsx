import { useMemo } from 'react';
import { 
  CheckCircle2, CircleDashed, ShieldAlert, 
  Activity, ArrowRight, TrendingUp, AlertOctagon 
} from 'lucide-react';

export default function ProjectSummary({ tasks }) {
  // Tính toán các chỉ số thống kê từ danh sách tasks
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'DONE').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const todo = tasks.filter(t => t.status === 'TODO').length;
    const blockedTasks = tasks.filter(t => t.isBlocked);
    
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);

    // Lấy 5 task mới cập nhật gần đây nhất
    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);

    return { total, done, inProgress, todo, blockedTasks, progress, recentTasks };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* 1. Hàng thẻ chỉ số (Metrics Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Tiến độ tổng thể</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-100">{stats.progress}%</h3>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Đã hoàn thành</p>
            <h3 className="text-2xl font-black text-emerald-400">{stats.done}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Đang thực hiện</p>
            <h3 className="text-2xl font-black text-blue-400">{stats.inProgress}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <CircleDashed className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-medium text-slate-400 mb-1">Đang bị kẹt (Blocked)</p>
            <h3 className={`text-2xl font-black ${stats.blockedTasks.length > 0 ? 'text-red-400' : 'text-slate-100'}`}>
              {stats.blockedTasks.length}
            </h3>
          </div>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center relative z-10 ${stats.blockedTasks.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          {/* Cảnh báo đỏ nếu có task bị kẹt */}
          {stats.blockedTasks.length > 0 && (
            <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Cột trái: Thanh tiến độ & Biểu đồ (Placeholder) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-200">Trạng thái công việc</h3>
              <span className="text-xs text-slate-400">Tổng: {stats.total} tasks</span>
            </div>
            
            {/* Thanh Progress Bar nhiều màu */}
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex mb-4">
              <div style={{ width: `${(stats.done / stats.total) * 100}%` }} className="bg-emerald-500 transition-all duration-500" title="Hoàn thành" />
              <div style={{ width: `${(stats.inProgress / stats.total) * 100}%` }} className="bg-blue-500 transition-all duration-500" title="Đang làm" />
              <div style={{ width: `${(stats.todo / stats.total) * 100}%` }} className="bg-slate-500 transition-all duration-500" title="Cần làm" />
            </div>

            <div className="flex justify-between text-xs font-medium">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {stats.done} Done
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> {stats.inProgress} In Progress
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span> {stats.todo} To Do
              </div>
            </div>
          </div>

          {/* Danh sách Task cập nhật gần đây */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Hoạt động gần đây
            </h3>
            <div className="space-y-3">
              {stats.recentTasks.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Chưa có hoạt động nào.</p>
              ) : (
                stats.recentTasks.map(task => (
                  <div key={task._id || task.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg hover:bg-slate-800 transition-colors">
                    <div className="flex flex-col gap-1 overflow-hidden pr-3">
                      <span className="text-xs font-medium text-slate-200 truncate">{task.title}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded font-semibold uppercase ${
                          task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {task.status}
                        </span>
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 3. Cột phải: Cảnh báo AI / Blockers */}
        <div className="space-y-6">
          <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />
              Cần chú ý gấp ({stats.blockedTasks.length})
            </h3>
            {stats.blockedTasks.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                <p className="text-xs text-emerald-400/80">Mọi thứ đang suôn sẻ! Không có task nào bị kẹt.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.blockedTasks.map(task => (
                  <div key={task._id || task.id} className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg space-y-2">
                    <h4 className="text-xs font-bold text-red-200 line-clamp-2">{task.title}</h4>
                    <p className="text-[11px] text-red-300/80 leading-relaxed bg-red-950/50 p-2 rounded">
                      {task.blockerReason || 'Đang gặp vấn đề chưa rõ nguyên nhân.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}