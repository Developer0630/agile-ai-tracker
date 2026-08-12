import { useState } from 'react';
import axios from 'axios';
import { Sparkles, CheckSquare, Square, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function TaskSubtaskSection({ task, onTaskUpdated }) {
  const [loading, setLoading] = useState(false);

  const toggleSubtask = async (subtaskId) => {
    try {
      const res = await axios.patch(`${API_BASE}/tasks/${task._id}/subtasks/${subtaskId}`);
      if (res.data.success) {
        if (onTaskUpdated) {
          onTaskUpdated(res.data.data);
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật subtask:", error);
      alert('Không thể cập nhật subtask!');
    }
  };

  const handleAiBreakdown = async () => {
    if (!task || !task._id || loading) return;

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/ai/breakdown/${task._id}`);
      if (res.data.success) {
        if (onTaskUpdated) {
          onTaskUpdated(res.data.data);
        }
      }
    } catch (error) {
      console.error('Lỗi AI Breakdown:', error);
      alert('Không thể chia nhỏ task lúc này. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Tính toán số lượng hoàn thành để hiển thị progress
  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter(s => s.completed).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div className="mt-4 pt-4 border-t border-slate-700/80">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Công việc con</span>
          {subtasks.length > 0 && (
            <span className="text-[10px] bg-slate-800 text-indigo-400 px-2 py-0.5 rounded-full font-medium border border-indigo-500/20">
              {completedCount}/{subtasks.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAiBreakdown}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-lg text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
          <span>✨ AI Breakdown</span>
        </button>
      </div>

      {/* Thanh tiến độ nhỏ (Progress bar) */}
      {subtasks.length > 0 && (
        <div className="w-full bg-slate-950 rounded-full h-1.5 mb-3 overflow-hidden border border-slate-800">
          <div 
            className="bg-indigo-500 h-full transition-all duration-300 rounded-full" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {subtasks.length > 0 ? (
          subtasks.map((sub, index) => (
            <div 
              key={sub._id || index} 
              onClick={() => toggleSubtask(sub._id)}
              className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                sub.completed 
                  ? 'bg-slate-950/30 border-slate-800/40 opacity-75' 
                  : 'bg-slate-950/60 border-slate-700/60 hover:border-indigo-500/40'
              }`}
            >
              <button 
                type="button" 
                className="text-slate-400 hover:text-indigo-400 mt-0.5 shrink-0"
              >
                {sub.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </button>
              <span className={`text-xs leading-relaxed select-none ${sub.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {sub.title}
              </span>
            </div>
          ))
        ) : (
          <p className="text-[11px] text-slate-500 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 text-center">
            Chưa có subtask nào. Bấm nút AI Breakdown để hệ thống tự động chia nhỏ công việc!
          </p>
        )}
      </div>
    </div>
  );
}