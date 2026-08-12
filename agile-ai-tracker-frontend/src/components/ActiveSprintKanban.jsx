import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function ActiveSprintKanban({ projectId, onTaskUpdate, onOpenCreateModal }) {
  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchKanbanData = async () => {
      if (!projectId) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const resSprint = await axios.get(`${API_BASE}/sprints/project/${projectId}/active`);
        const activeSprint = resSprint.data.data || resSprint.data;

        if (isMounted) setSprint(activeSprint);

        if (activeSprint?._id || activeSprint?.id) {
          const sId = activeSprint._id || activeSprint.id;
          const resTasks = await axios.get(`${API_BASE}/tasks/sprint/${sId}`);
          if (isMounted) setTasks(resTasks.data.data || resTasks.data || []);
        } else {
          if (isMounted) setTasks([]);
        }
      } catch (err) {
        console.error('Lỗi lấy dữ liệu Kanban:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchKanbanData();

    return () => { isMounted = false; };
  }, [projectId, onTaskUpdate]);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa task này?')) return;
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => (t._id || t.id) !== taskId));
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      console.error('Lỗi khi xóa task:', err);
      alert('Lỗi khi xóa task!');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic Update: Cập nhật giao diện lập tức cho mượt
    setTasks(prev => prev.map(t => (t._id || t.id) === taskId ? { ...t, status: newStatus } : t));

    try {
      // Sửa lại đoạn này: Gọi đúng vào route /status chuyên biệt của backend
      await axios.put(`${API_BASE}/tasks/${taskId}/status`, { status: newStatus });
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert('Không thể cập nhật trạng thái!');
    }
  };

  // --- HÀM XỬ LÝ KÉO THẢ (DRAG & DROP) ---
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Bắt buộc phải có để cột chấp nhận sự kiện Drop
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      handleStatusChange(taskId, targetStatus);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-xs">
        Đang tải dữ liệu Kanban Board...
      </div>
    );
  }

  const columns = [
    { id: 'TODO', title: 'CẦN LÀM', color: 'border-slate-700' },
    { id: 'IN_PROGRESS', title: 'ĐANG LÀM', color: 'border-blue-500/40' },
    { id: 'DONE', title: 'HOÀN THÀNH', color: 'border-emerald-500/40' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>{sprint ? sprint.name : 'Chưa có Sprint nào đang chạy'}</span>
            {sprint && (
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] rounded-full uppercase tracking-wider font-semibold">
                Active
              </span>
            )}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {sprint?.goal ? `Mục tiêu: ${sprint.goal}` : 'Hãy bắt đầu một Sprint trong trang Backlog để theo dõi công việc tại đây.'}
          </p>
        </div>
        <button
          onClick={() => onOpenCreateModal && onOpenCreateModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-col min-h-[500px] transition-colors hover:border-slate-700/80"
            >
              <div className={`flex items-center justify-between pb-2.5 mb-3 border-b ${col.color}`}>
                <span className="text-xs font-bold text-slate-300 tracking-wide">{col.title}</span>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {colTasks.map(task => {
                  const tId = task._id || task.id;
                  return (
                    <div
                      key={tId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tId)}
                      onClick={(e) => {
                        // Chỉ mở chi tiết khi người dùng click trực tiếp vào card (tránh click nhầm nút xóa/sửa)
                        if (!e.target.closest('button') && !e.target.closest('select')) {
                          onOpenCreateModal(task);
                        }
                      }}
                      className="bg-slate-800/90 border border-slate-700/60 hover:border-indigo-500/50 p-3 rounded-lg shadow-sm space-y-2 group transition-all cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-medium text-slate-100 line-clamp-2">{task.title}</h4>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onOpenCreateModal(task)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 cursor-pointer">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteTask(tId)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 cursor-pointer">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-700/40 text-[10px]">
                        <span className={`font-semibold px-1.5 py-0.5 rounded ${task.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                            task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                              task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-300'
                          }`}>
                          {task.priority || 'MEDIUM'}
                        </span>

                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(tId, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none cursor-pointer"
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="DONE">DONE</option>
                        </select>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-24 border border-dashed border-slate-800/80 rounded-lg flex items-center justify-center text-[11px] text-slate-600">
                    Kéo thả task vào đây
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}