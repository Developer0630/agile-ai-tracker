import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Play, Calendar, GripVertical, ChevronDown, ChevronRight, Layers, Edit2, Trash2, Check, X } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function BacklogView({ projectId, onTaskUpdate, onOpenCreateModal }) {
  const [sprints, setSprints] = useState([]);
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [loading, setLoading] = useState(!!projectId); 
  const [newSprintName, setNewSprintName] = useState('');
  const [showSprintModal, setShowSprintModal] = useState(false);
  
  // State quản lý đóng/mở từng Sprint
  const [expandedSprints, setExpandedSprints] = useState({});

  // State chỉnh sửa tên Sprint trực tiếp (Inline Edit)
  const [editingSprintId, setEditingSprintId] = useState(null);
  const [editingSprintName, setEditingSprintName] = useState('');

  const refreshBacklogData = async () => {
    if (!projectId) return;
    try {
      const [resSprints, resBacklog] = await Promise.all([
        axios.get(`${API_BASE}/sprints/project/${projectId}`),
        axios.get(`${API_BASE}/tasks/backlog/${projectId}`)
      ]);
      const loadedSprints = resSprints.data.data || resSprints.data || [];
      setSprints(loadedSprints);
      setBacklogTasks(resBacklog.data.data || resBacklog.data || []);

      if (loadedSprints.length > 0 && Object.keys(expandedSprints).length === 0) {
        const firstId = loadedSprints[0]._id || loadedSprints[0].id;
        setExpandedSprints({ [firstId]: true });
      }
    } catch (err) {
      console.error('Lỗi làm mới dữ liệu Backlog:', err);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    let ignore = false;

    async function fetchData() {
      try {
        const [resSprints, resBacklog] = await Promise.all([
          axios.get(`${API_BASE}/sprints/project/${projectId}`),
          axios.get(`${API_BASE}/tasks/backlog/${projectId}`)
        ]);

        if (!ignore) {
          const loadedSprints = resSprints.data.data || resSprints.data || [];
          setSprints(loadedSprints);
          setBacklogTasks(resBacklog.data.data || resBacklog.data || []);
          
          if (loadedSprints.length > 0) {
            const firstId = loadedSprints[0]._id || loadedSprints[0].id;
            setExpandedSprints({ [firstId]: true });
          }
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu Backlog:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchData();
    return () => { ignore = true; };
  }, [projectId]);

  const toggleSprint = (sprintId) => {
    setExpandedSprints(prev => ({
      ...prev,
      [sprintId]: !prev[sprintId]
    }));
  };

  // --- XỬ LÝ SỬA TÊN SPRINT ---
  const handleStartEditSprint = (e, sprint) => {
    e.stopPropagation();
    const sId = sprint._id || sprint.id;
    setEditingSprintId(sId);
    setEditingSprintName(sprint.name);
  };

  const handleSaveSprintName = async (e, sprintId) => {
    e.stopPropagation();
    if (!editingSprintName.trim()) return;

    try {
      await axios.put(`${API_BASE}/sprints/${sprintId}`, { name: editingSprintName });
      setEditingSprintId(null);
      await refreshBacklogData();
    } catch (err) {
      console.error('Lỗi khi đổi tên Sprint:', err);
      alert('Không thể cập nhật tên Sprint!');
    }
  };

  const handleCancelEditSprint = (e) => {
    e.stopPropagation();
    setEditingSprintId(null);
  };

  // --- XỬ LÝ XÓA SPRINT ---
  const handleDeleteSprint = async (e, sprintId) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa Sprint này? Các task bên trong sẽ được đưa về Product Backlog.')) return;

    try {
      await axios.delete(`${API_BASE}/sprints/${sprintId}`);
      await refreshBacklogData();
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      console.error('Lỗi khi xóa Sprint:', err);
      alert('Không thể xóa Sprint!');
    }
  };

  // --- XỬ LÝ XÓA TASK ---
  const handleDeleteTask = async (e, taskId) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa task này?')) return;

    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`);
      await refreshBacklogData();
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      console.error('Lỗi khi xóa task:', err);
      alert('Không thể xóa task!');
    }
  };

  // --- XỬ LÝ SỬA TASK ---
  const handleEditTask = (e, task) => {
    e.stopPropagation();
    if (onOpenCreateModal) {
      onOpenCreateModal(task);
    }
  };

  // Drag & Drop
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnSprint = async (e, targetSprintId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    try {
      await axios.put(`${API_BASE}/tasks/${taskId}`, { sprintId: targetSprintId });
      await refreshBacklogData();
      if (onTaskUpdate) onTaskUpdate();
    } catch {
      alert('Không thể gán Task vào Sprint!');
    }
  };

  const handleDropOnBacklog = async (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    try {
      await axios.put(`${API_BASE}/tasks/${taskId}`, { sprintId: null });
      await refreshBacklogData();
      if (onTaskUpdate) onTaskUpdate();
    } catch {
      alert('Không thể chuyển Task về Backlog!');
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;

    try {
      const res = await axios.post(`${API_BASE}/sprints`, {
        projectId,
        name: newSprintName
      });
      const created = res.data.data || res.data;
      setSprints(prev => [...prev, created]);
      const newId = created._id || created.id;
      setExpandedSprints(prev => ({ ...prev, [newId]: true }));
      setNewSprintName('');
      setShowSprintModal(false);
    } catch {
      alert('Không thể tạo Sprint!');
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      await axios.put(`${API_BASE}/sprints/${sprintId}/start`);
      await refreshBacklogData();
      if (onTaskUpdate) onTaskUpdate();
    } catch {
      alert('Lỗi khi kích hoạt Sprint!');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400 text-xs">Đang tải Backlog...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Backlog & Quản lý Sprint</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kéo thả, chỉnh sửa tên hoặc xóa Sprint và Task trực tiếp.
          </p>
        </div>
        <button
          onClick={() => setShowSprintModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo Sprint Mới</span>
        </button>
      </div>

      {/* Danh sách Sprints */}
      <div className="space-y-3">
        {sprints.map(sprint => {
          const sId = sprint._id || sprint.id;
          const isSprintActive = sprint.status?.toUpperCase() === 'ACTIVE';
          const isExpanded = !!expandedSprints[sId];
          const isEditing = editingSprintId === sId;
          const taskCount = sprint.tasks?.length || 0;

          return (
            <div
              key={sId}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnSprint(e, sId)}
              className={`bg-slate-900/60 border rounded-xl overflow-hidden transition-all ${
                isExpanded ? 'border-slate-700/80 shadow-md' : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Sprint Bar Header */}
              <div 
                onClick={() => toggleSprint(sId)}
                className="flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer select-none transition-colors group/sprint"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                  <button type="button" className="text-slate-400 hover:text-slate-200 shrink-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />

                  {/* Cho phép sửa tên Sprint trực tiếp */}
                  {isEditing ? (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingSprintName}
                        onChange={(e) => setEditingSprintName(e.target.value)}
                        className="bg-slate-950 border border-indigo-500 rounded px-2 py-0.5 text-xs text-slate-100 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={(e) => handleSaveSprintName(e, sId)}
                        className="p-1 hover:bg-emerald-600/20 text-emerald-400 rounded"
                        title="Lưu"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelEditSprint}
                        className="p-1 hover:bg-red-600/20 text-red-400 rounded"
                        title="Hủy"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-200 truncate">{sprint.name}</span>
                  )}

                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                    isSprintActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}>
                    {sprint.status || 'PLANNED'}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400 bg-slate-950/50 px-2 py-0.5 rounded-md shrink-0">
                    {taskCount} tasks
                  </span>
                </div>

                {/* Các nút hành động trên thanh Sprint */}
                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  {!isSprintActive && (
                    <button
                      onClick={() => handleStartSprint(sId)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-medium rounded-lg cursor-pointer transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span>Bắt đầu</span>
                    </button>
                  )}

                  {/* Nút Sửa/Xóa Sprint */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover/sprint:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleStartEditSprint(e, sprint)}
                        title="Đổi tên Sprint"
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSprint(e, sId)}
                        title="Xóa Sprint"
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Vùng Tasks trong Sprint */}
              {isExpanded && (
                <div className="p-3 bg-slate-950/30 border-t border-slate-800/60">
                  <div className="max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                    {sprint.tasks && sprint.tasks.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                        {sprint.tasks.map(task => {
                          const taskId = task._id || task.id;
                          return (
                            <div
                              key={taskId}
                              draggable
                              onDragStart={(e) => handleDragStart(e, taskId)}
                              className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 p-2.5 rounded-lg flex items-center justify-between text-xs cursor-grab active:cursor-grabbing transition-all shadow-sm group"
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
                                <span className="text-slate-200 font-medium truncate">{task.title}</span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                                  task.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                                  task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-300'
                                }`}>
                                  {task.priority || 'MEDIUM'}
                                </span>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleEditTask(e, task)}
                                    title="Sửa Task"
                                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteTask(e, taskId)}
                                    title="Xóa Task"
                                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-6 border border-dashed border-slate-800/80 rounded-lg text-center">
                        <p className="text-xs text-slate-500">Sprint này chưa có task.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Khu vực Product Backlog */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDropOnBacklog}
        className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 space-y-3 transition-colors"
      >
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Product Backlog
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-full">
              {backlogTasks.length} task chưa gán
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Thả vào đây để đưa Task về Backlog</span>
        </div>

        <div className="max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {backlogTasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {backlogTasks.map(task => {
                const taskId = task._id || task.id;
                return (
                  <div
                    key={taskId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, taskId)}
                    className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 p-2.5 rounded-lg flex items-center justify-between text-xs cursor-grab active:cursor-grabbing transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
                      <span className="text-slate-200 font-medium truncate">{task.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                        task.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {task.priority || 'MEDIUM'}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditTask(e, task)}
                          title="Sửa Task"
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTask(e, taskId)}
                          title="Xóa Task"
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              Chưa có task nào trong Product Backlog.
            </div>
          )}
        </div>
      </div>

      {/* Modal Tạo Sprint */}
      {showSprintModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <form onSubmit={handleCreateSprint} className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-sm p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Tạo Sprint Mới</h3>
            <input
              type="text"
              placeholder="Tên Sprint (VD: Sprint 1 - Core Features)"
              value={newSprintName}
              onChange={(e) => setNewSprintName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setShowSprintModal(false)} 
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white cursor-pointer"
              >
                Tạo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}