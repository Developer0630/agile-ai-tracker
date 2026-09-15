import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button, PageHeader, LoadingState, EmptyState, StatusBadge, PriorityBadge } from './ui';

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
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => (t._id || t.id) !== taskId));
      if (onTaskUpdate) onTaskUpdate();
    } catch {
      alert('Lỗi khi xóa task!');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => (t._id || t.id) === taskId ? { ...t, status: newStatus } : t));
    try {
      await axios.put(`${API_BASE}/tasks/${taskId}/status`, { status: newStatus });
      if (onTaskUpdate) onTaskUpdate();
    } catch {
      alert('Không thể cập nhật trạng thái!');
    }
  };

  const handleDragStart = (e, taskId) => e.dataTransfer.setData('taskId', taskId);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) handleStatusChange(taskId, targetStatus);
  };

  if (loading) return <LoadingState message="Loading board..." />;

  const columns = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'DONE', title: 'Done' }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={sprint ? sprint.name : 'No active sprint'}
        description={sprint?.goal || 'Start a sprint from the Backlog to track work here.'}
        actions={
          <Button variant="primary" size="sm" onClick={() => onOpenCreateModal?.()}>
            <Plus className="w-3.5 h-3.5" /> Create
          </Button>
        }
      />

      {sprint && <StatusBadge status="ACTIVE" />}

      {!sprint ? (
        <EmptyState title="No active sprint" description="Go to Backlog and start a sprint to use the board." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="bg-[#F4F5F7] border border-[#DFE1E6] rounded-[3px] flex flex-col min-h-[420px]"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#DFE1E6] bg-white">
                  <span className="text-xs font-semibold text-[#44546F] uppercase">{col.title}</span>
                  <span className="text-xs text-[#626F86] bg-[#F4F5F7] px-1.5 py-0.5 rounded-[3px]">{colTasks.length}</span>
                </div>
                <div className="p-2 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
                  {colTasks.map(task => {
                    const tId = task._id || task.id;
                    return (
                      <div
                        key={tId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, tId)}
                        onClick={(e) => {
                          if (!e.target.closest('button') && !e.target.closest('select')) {
                            onOpenCreateModal(task);
                          }
                        }}
                        className="bg-white border border-[#DFE1E6] rounded-[3px] p-2.5 cursor-grab active:cursor-grabbing hover:bg-[#FAFBFC] group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm text-[#172B4D] line-clamp-2">{task.title}</p>
                          <div className="flex opacity-0 group-hover:opacity-100 shrink-0">
                            <button type="button" onClick={() => onOpenCreateModal(task)} className="p-0.5 text-[#626F86] hover:text-[#172B4D] cursor-pointer"><Edit2 className="w-3 h-3" /></button>
                            <button type="button" onClick={() => handleDeleteTask(tId)} className="p-0.5 text-[#626F86] hover:text-[#DE350B] cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                        {task.description && <p className="text-xs text-[#626F86] line-clamp-2 mb-2">{task.description}</p>}
                        <div className="flex items-center justify-between pt-2 border-t border-[#DFE1E6]">
                          <PriorityBadge priority={task.priority} />
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(tId, e.target.value)}
                            className="h-6 px-1 text-[11px] border border-[#DFE1E6] rounded-[3px] bg-white text-[#44546F] cursor-pointer"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <p className="text-xs text-[#8993A4] text-center py-6 border border-dashed border-[#DFE1E6] rounded-[3px]">Drop tasks here</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
