import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Play, ChevronDown, ChevronRight, Edit2, Trash2, Check, X, GripVertical } from 'lucide-react';
import {
  Button, PageHeader, LoadingState, EmptyState, StatusBadge, PriorityBadge, Modal, Input
} from './ui';

const API_BASE = 'http://localhost:5000/api';

export default function BacklogView({ projectId, onTaskUpdate, onOpenCreateModal }) {
  const [sprints, setSprints] = useState([]);
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [loading, setLoading] = useState(!!projectId);
  const [newSprintName, setNewSprintName] = useState('');
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [expandedSprints, setExpandedSprints] = useState({});
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
    setExpandedSprints(prev => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  const handleStartEditSprint = (e, sprint) => {
    e.stopPropagation();
    setEditingSprintId(sprint._id || sprint.id);
    setEditingSprintName(sprint.name);
  };

  const handleSaveSprintName = async (e, sprintId) => {
    e.stopPropagation();
    if (!editingSprintName.trim()) return;
    try {
      await axios.put(`${API_BASE}/sprints/${sprintId}`, { name: editingSprintName });
      setEditingSprintId(null);
      await refreshBacklogData();
    } catch {
      alert('Không thể cập nhật tên Sprint!');
    }
  };

  const handleDeleteSprint = async (e, sprintId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this sprint? Tasks will return to the backlog.')) return;
    try {
      await axios.delete(`${API_BASE}/sprints/${sprintId}`);
      await refreshBacklogData();
      if (onTaskUpdate) onTaskUpdate();
    } catch {
      alert('Không thể xóa Sprint!');
    }
  };

  const handleDeleteTask = async (e, taskId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`);
      await refreshBacklogData();
      if (onTaskUpdate) onTaskUpdate();
    } catch {
      alert('Không thể xóa task!');
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => e.preventDefault();

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
      const res = await axios.post(`${API_BASE}/sprints`, { projectId, name: newSprintName });
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

  const TaskRow = ({ task }) => {
    const taskId = task._id || task.id;
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, taskId)}
        className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-[#DFE1E6] rounded-[3px] hover:bg-[#F4F5F7] cursor-grab active:cursor-grabbing group"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GripVertical className="w-3.5 h-3.5 text-[#C1C7D0] shrink-0" />
          <span className="text-sm text-[#172B4D] truncate">{task.title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PriorityBadge priority={task.priority} />
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={(e) => { e.stopPropagation(); onOpenCreateModal?.(task); }} className="p-1 text-[#626F86] hover:text-[#172B4D] cursor-pointer" aria-label="Edit">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={(e) => handleDeleteTask(e, taskId)} className="p-1 text-[#626F86] hover:text-[#DE350B] cursor-pointer" aria-label="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <LoadingState message="Loading backlog..." />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Backlog"
        description="Plan sprints and assign work from the product backlog."
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowSprintModal(true)}>
            <Plus className="w-3.5 h-3.5" /> Create sprint
          </Button>
        }
      />

      <div className="space-y-2">
        {sprints.map(sprint => {
          const sId = sprint._id || sprint.id;
          const isActive = sprint.status?.toUpperCase() === 'ACTIVE';
          const isExpanded = !!expandedSprints[sId];
          const isEditing = editingSprintId === sId;
          const taskCount = sprint.tasks?.length || 0;

          return (
            <div
              key={sId}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnSprint(e, sId)}
              className="bg-white border border-[#DFE1E6] rounded-[3px] overflow-hidden"
            >
              <div
                onClick={() => toggleSprint(sId)}
                className="flex items-center justify-between px-3 py-2 bg-[#F4F5F7] border-b border-[#DFE1E6] cursor-pointer hover:bg-[#EBECF0] group/sprint"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-[#626F86]" /> : <ChevronRight className="w-4 h-4 text-[#626F86]" />}
                  {isEditing ? (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingSprintName}
                        onChange={(e) => setEditingSprintName(e.target.value)}
                        className="h-7 px-2 text-sm border border-[#4C9AFF] rounded-[3px] focus:outline-none"
                        autoFocus
                      />
                      <button type="button" onClick={(e) => handleSaveSprintName(e, sId)} className="p-1 text-[#006644] cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setEditingSprintId(null); }} className="p-1 text-[#DE350B] cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-[#172B4D] truncate">{sprint.name}</span>
                  )}
                  <StatusBadge status={sprint.status || 'PLANNED'} />
                  <span className="text-xs text-[#626F86]">{taskCount} issues</span>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  {!isActive && (
                    <Button variant="secondary" size="sm" onClick={() => handleStartSprint(sId)}>
                      <Play className="w-3 h-3" /> Start
                    </Button>
                  )}
                  {!isEditing && (
                    <div className="flex opacity-0 group-hover/sprint:opacity-100">
                      <button type="button" onClick={(e) => handleStartEditSprint(e, sprint)} className="p-1 text-[#626F86] hover:text-[#172B4D] cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={(e) => handleDeleteSprint(e, sId)} className="p-1 text-[#626F86] hover:text-[#DE350B] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              </div>
              {isExpanded && (
                <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar">
                  {sprint.tasks?.length > 0 ? sprint.tasks.map(task => <TaskRow key={task._id || task.id} task={task} />) : (
                    <p className="text-xs text-[#626F86] text-center py-4 border border-dashed border-[#DFE1E6] rounded-[3px]">Drop tasks here</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDropOnBacklog}
        className="bg-white border border-[#DFE1E6] rounded-[3px]"
      >
        <div className="px-3 py-2 border-b border-[#DFE1E6] bg-[#F4F5F7] flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#172B4D]">Product backlog</h3>
          <span className="text-xs text-[#626F86]">{backlogTasks.length} unassigned</span>
        </div>
        <div className="p-2 space-y-1.5 max-h-80 overflow-y-auto custom-scrollbar">
          {backlogTasks.length > 0 ? backlogTasks.map(task => <TaskRow key={task._id || task.id} task={task} />) : (
            <EmptyState title="Backlog is empty" description="All tasks are assigned to sprints." />
          )}
        </div>
      </div>

      <Modal
        isOpen={showSprintModal}
        onClose={() => setShowSprintModal(false)}
        title="Create sprint"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowSprintModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateSprint}>Create</Button>
          </>
        }
      >
        <form onSubmit={handleCreateSprint}>
          <Input
            label="Sprint name"
            type="text"
            required
            value={newSprintName}
            onChange={(e) => setNewSprintName(e.target.value)}
            placeholder="Sprint 1"
          />
        </form>
      </Modal>
    </div>
  );
}
