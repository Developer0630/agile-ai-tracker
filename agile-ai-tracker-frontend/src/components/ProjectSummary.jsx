import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { 
  TrendingUp, CheckCircle2, CircleDashed, ShieldAlert,
  AlertOctagon, Clock, Users, Sparkles, RefreshCw, AlertTriangle
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function ProjectSummary({ tasks = [], project }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Phân tích dữ liệu chuyên sâu
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'DONE').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const todo = tasks.filter(t => t.status === 'TODO').length;
    const blockedTasks = tasks.filter(t => t.isBlocked);
    
    // Tác vụ quá hạn (Overdue)
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE');

    // Phân bổ theo mức độ ưu tiên
    const priorityCounts = {
      URGENT: tasks.filter(t => t.priority === 'URGENT').length,
      HIGH: tasks.filter(t => t.priority === 'HIGH').length,
      MEDIUM: tasks.filter(t => t.priority === 'MEDIUM').length,
      LOW: tasks.filter(t => t.priority === 'LOW').length,
    };

    // Phân bổ khối lượng công việc theo Thành viên (Workload)
    const workloadMap = {};
    tasks.forEach(t => {
      const name = t.assignee?.name || t.assignee?.email || 'Chưa gán';
      if (!workloadMap[name]) {
        workloadMap[name] = { total: 0, done: 0, inProgress: 0, todo: 0 };
      }
      workloadMap[name].total += 1;
      if (t.status === 'DONE') workloadMap[name].done += 1;
      else if (t.status === 'IN_PROGRESS') workloadMap[name].inProgress += 1;
      else workloadMap[name].todo += 1;
    });

    const progress = total === 0 ? 0 : Math.round((done / total) * 100);

    return { 
      total, done, inProgress, todo, 
      blockedTasks, overdueTasks, priorityCounts, 
      workloadMap, progress 
    };
  }, [tasks]);

  // Kích hoạt AI Project Health Check
  const handleRunAiAudit = async () => {
    setAnalyzing(true);
    try {
      const res = await axios.post(`${API_BASE}/ai/project-health-check`, {
        projectName: project?.name,
        stats: {
          total: stats.total,
          progress: `${stats.progress}%`,
          blockedCount: stats.blockedTasks.length,
          overdueCount: stats.overdueTasks.length,
          urgentCount: stats.priorityCounts.URGENT + stats.priorityCounts.HIGH,
          blockedReasons: stats.blockedTasks.map(t => `${t.title}: ${t.blockerReason || 'Không rõ'}`),
        }
      });
      setAiAnalysis(res.data.data?.analysis || res.data.analysis);
    } catch (err) {
      console.error('Lỗi phân tích AI:', err);
      setAiAnalysis('Không thể kết nối đến trợ lý AI. Vui lòng thử lại sau.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto">
      
      {/* 1. AI Health Check Alert Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/60 border border-indigo-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                AI Project Health Check
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">Gemini 2.5</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {aiAnalysis || "Trợ lý AI sẽ quét toàn bộ khối lượng công việc, rủi ro trễ hạn và các tác vụ bị kẹt để đánh giá sức khỏe dự án."}
              </p>
            </div>
          </div>
          <button
            onClick={handleRunAiAudit}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-md disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Đang phân tích...' : 'Phân tích dự án'}
          </button>
        </div>
      </div>

      {/* 2. Hàng Thẻ Chỉ Số Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Tiến độ */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Tiến độ dự án</p>
            <h3 className="text-2xl font-black text-slate-100">{stats.progress}%</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{stats.done}/{stats.total} tác vụ hoàn tất</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card Đang thực hiện */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Đang triển khai</p>
            <h3 className="text-2xl font-black text-blue-400">{stats.inProgress}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{stats.todo} tác vụ chờ làm (Todo)</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <CircleDashed className="w-5 h-5" />
          </div>
        </div>

        {/* Card Quá hạn (Overdue) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Trễ hạn (Overdue)</p>
            <h3 className={`text-2xl font-black ${stats.overdueTasks.length > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
              {stats.overdueTasks.length}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Cần đẩy nhanh tiến độ</p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stats.overdueTasks.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card Bị kẹt (Blocked) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Tác vụ bị tắc nghẽn</p>
            <h3 className={`text-2xl font-black ${stats.blockedTasks.length > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
              {stats.blockedTasks.length}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Đang chờ gỡ khó</p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stats.blockedTasks.length > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Lưới chi tiết: Workload & Trạng thái phân bổ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột Trái: Workload phân bổ theo thành viên */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Thanh phân bổ trạng thái */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Cấu trúc công việc</h3>
              <span className="text-xs text-slate-400">Tổng cộng: {stats.total} tác vụ</span>
            </div>
            
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex mb-3">
              <div style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }} className="bg-emerald-500 transition-all duration-500" />
              <div style={{ width: `${stats.total ? (stats.inProgress / stats.total) * 100 : 0}%` }} className="bg-blue-500 transition-all duration-500" />
              <div style={{ width: `${stats.total ? (stats.todo / stats.total) * 100 : 0}%` }} className="bg-slate-600 transition-all duration-500" />
            </div>

            <div className="grid grid-cols-3 text-center text-xs pt-1 border-t border-slate-800/80">
              <div className="text-emerald-400 font-medium">{stats.done} Đã hoàn thành</div>
              <div className="text-blue-400 font-medium">{stats.inProgress} Đang làm</div>
              <div className="text-slate-400 font-medium">{stats.todo} Chưa bắt đầu</div>
            </div>
          </div>

          {/* Phân bổ nhân sự (Team Workload) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Phân bổ khối lượng thành viên (Team Workload)
            </h3>

            {Object.keys(stats.workloadMap).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Chưa có dữ liệu thành viên.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.workloadMap).map(([name, data]) => {
                  const memberDonePercent = Math.round((data.done / data.total) * 100);
                  return (
                    <div key={name} className="space-y-1.5 bg-slate-950/40 border border-slate-800/60 p-3 rounded-lg">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-200">{name}</span>
                        <span className="text-slate-400">{data.done}/{data.total} tasks ({memberDonePercent}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div style={{ width: `${(data.done / data.total) * 100}%` }} className="bg-emerald-500" />
                        <div style={{ width: `${(data.inProgress / data.total) * 100}%` }} className="bg-blue-500" />
                        <div style={{ width: `${(data.todo / data.total) * 100}%` }} className="bg-slate-700" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Cột Phải: Blockers & Overdue Warnings */}
        <div className="space-y-6">
          
          {/* Cảnh báo Blockers */}
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />
              Cần gỡ nghẽn ({stats.blockedTasks.length})
            </h3>
            {stats.blockedTasks.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400/60 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400">Không có tác vụ nào bị nghẽn.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {stats.blockedTasks.map(t => (
                  <div key={t._id || t.id} className="p-2.5 bg-rose-950/40 border border-rose-900/60 rounded-lg text-xs">
                    <p className="font-semibold text-rose-200 truncate">{t.title}</p>
                    <p className="text-[11px] text-rose-300/80 mt-1 line-clamp-2">{t.blockerReason || 'Chưa ghi rõ lý do.'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cảnh báo Quá hạn */}
          <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Tác vụ quá hạn ({stats.overdueTasks.length})
            </h3>
            {stats.overdueTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Tất cả tiến độ đều đúng hạn.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {stats.overdueTasks.map(t => (
                  <div key={t._id || t.id} className="p-2 bg-amber-950/40 border border-amber-900/60 rounded-lg text-xs flex justify-between items-center">
                    <span className="text-amber-200 truncate pr-2">{t.title}</span>
                    <span className="text-[10px] text-amber-400 font-mono shrink-0">
                      {new Date(t.dueDate).toLocaleDateString('vi-VN')}
                    </span>
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