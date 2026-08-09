import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { Play, GripVertical, Plus, Layers, Calendar } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';
const BACKLOG_DROPPABLE_ID = 'backlog';

const toId = (id) => (id == null ? '' : String(id));

const findSprintByDroppableId = (sprintList, droppableId) =>
  sprintList.find((s) => toId(s._id) === toId(droppableId));

export default function BacklogView({ projectId = 'default_project_id' }) {
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Tạo Sprint
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [resBacklog, resSprints] = await Promise.all([
        axios.get(`${API_BASE_URL}/tasks/backlog/${projectId}`),
        axios.get(`${API_BASE_URL}/sprints/project/${projectId}`)
      ]);
      setBacklogTasks(resBacklog.data.data || []);
      setSprints(resSprints.data.data || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  // Tạo Sprint Mới
  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!sprintName.trim()) return;

    try {
      await axios.post(`${API_BASE_URL}/sprints`, {
        name: sprintName,
        goal: sprintGoal,
        projectId,
        status: 'planned'
      });
      setSprintName('');
      setSprintGoal('');
      setShowCreateSprint(false);
      fetchData();
    } catch (error) {
      console.error('Lỗi khi tạo Sprint mới:', error);
      alert('Không thể tạo Sprint mới!');
    }
  };

  // Kéo / Thả công việc
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      toId(source.droppableId) === toId(destination.droppableId) &&
      source.index === destination.index
    ) {
      return;
    }

    const targetSprintId =
      toId(destination.droppableId) === BACKLOG_DROPPABLE_ID
        ? null
        : destination.droppableId;

    let movedTask;
    let newBacklog = [...backlogTasks];
    let newSprints = sprints.map((s) => ({ ...s, tasks: [...(s.tasks || [])] }));

    if (toId(source.droppableId) === BACKLOG_DROPPABLE_ID) {
      [movedTask] = newBacklog.splice(source.index, 1);
    } else {
      const sourceSprint = findSprintByDroppableId(newSprints, source.droppableId);
      if (sourceSprint) [movedTask] = sourceSprint.tasks.splice(source.index, 1);
    }

    if (!movedTask) return;
    movedTask = { ...movedTask, sprintId: targetSprintId };

    if (toId(destination.droppableId) === BACKLOG_DROPPABLE_ID) {
      newBacklog.splice(destination.index, 0, movedTask);
    } else {
      const destSprint = findSprintByDroppableId(newSprints, destination.droppableId);
      if (destSprint) destSprint.tasks.splice(destination.index, 0, movedTask);
    }

    setBacklogTasks(newBacklog);
    setSprints(newSprints);

    try {
      await axios.put(`${API_BASE_URL}/tasks/${draggableId}`, {
        sprintId: targetSprintId
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật Task trên server:', error);
      fetchData();
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      await axios.put(`${API_BASE_URL}/sprints/${sprintId}/start`);
      alert('Đã kích hoạt Sprint thành công!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể kích hoạt Sprint');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">Đang tải danh sách Backlog & Sprint...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* HEADER & NÚT TẠO SPRINT */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Quản lý Backlog & Sprint</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Kéo thả công việc từ Product Backlog vào các Sprint để lên kế hoạch làm việc.</p>
        </div>

        <button
          onClick={() => setShowCreateSprint(!showCreateSprint)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Sprint Mới</span>
        </button>
      </div>

      {/* FORM TẠO SPRINT NHANH */}
      {showCreateSprint && (
        <form onSubmit={handleCreateSprint} className="bg-slate-900 border border-indigo-500/30 p-4 rounded-xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              placeholder="Tên Sprint (VD: Sprint 1 - Sprint UI/UX)..."
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              placeholder="Mục tiêu Sprint (Ví dụ: Hoàn thành Luồng Đăng nhập)..."
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateSprint(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
            >
              Lưu Sprint
            </button>
          </div>
        </form>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        
        {/* DANH SÁCH SPRINT */}
        <div className="space-y-4">
          {sprints.map((sprint) => {
            const isActive = sprint.status?.toLowerCase() === 'active';

            return (
              <div 
                key={sprint._id} 
                className={`bg-[#0F172A]/70 border rounded-xl p-4 space-y-3 transition-all ${
                  isActive ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800/90'
                }`}
              >
                {/* Sprint Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-bold text-slate-200 text-xs">{sprint.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        isActive 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                      }`}>
                        {sprint.status || 'PLANNED'}
                      </span>
                    </div>
                    {sprint.goal && (
                      <p className="text-[11px] text-slate-400 mt-1 pl-6">🎯 Goal: {sprint.goal}</p>
                    )}
                  </div>

                  {sprint.status?.toLowerCase() === 'planned' && (
                    <button
                      onClick={() => handleStartSprint(sprint._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Sprint</span>
                    </button>
                  )}
                </div>

                {/* Drop Zone cho Sprint */}
                <Droppable droppableId={toId(sprint._id)}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[60px] rounded-lg p-2 border border-dashed transition-colors space-y-2 ${
                        snapshot.isDraggingOver 
                          ? 'bg-indigo-950/30 border-indigo-500/50' 
                          : 'bg-slate-950/40 border-slate-800'
                      }`}
                    >
                      {sprint.tasks?.map((task, index) => (
                        <TaskItem key={task._id} task={task} index={index} />
                      ))}
                      {provided.placeholder}
                      {(!sprint.tasks || sprint.tasks.length === 0) && (
                        <div className="text-center text-slate-500 text-xs py-3">
                          Kéo thả công việc vào đây để thêm vào Sprint
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>

        {/* PRODUCT BACKLOG */}
        <div className="bg-[#0F172A]/70 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
            Product Backlog ({backlogTasks.length} công việc chưa phân bổ)
          </h3>

          <Droppable droppableId={BACKLOG_DROPPABLE_ID}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[100px] rounded-lg p-2 border border-dashed transition-colors space-y-2 ${
                  snapshot.isDraggingOver 
                    ? 'bg-indigo-950/30 border-indigo-500/50' 
                    : 'bg-slate-950/40 border-slate-800'
                }`}
              >
                {backlogTasks.map((task, index) => (
                  <TaskItem key={task._id} task={task} index={index} />
                ))}
                {provided.placeholder}
                {backlogTasks.length === 0 && (
                  <div className="text-center text-slate-500 text-xs py-6">
                    Không còn công việc nào trong Backlog.
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </div>

      </DragDropContext>
    </div>
  );
}

function TaskItem({ task, index }) {
  const getPriorityBadge = (priority) => {
    const p = priority?.toUpperCase();
    switch (p) {
      case 'URGENT':
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-700/60 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <Draggable draggableId={toId(task._id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3 rounded-lg border transition-all flex items-center justify-between text-xs cursor-grab active:cursor-grabbing ${
            snapshot.isDragging
              ? 'bg-slate-800 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.01]'
              : 'bg-slate-800/90 border-slate-700/70 hover:border-slate-500'
          }`}
          style={provided.draggableProps.style}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
            <GripVertical className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="font-medium text-slate-100 truncate">{task.title}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${getPriorityBadge(task.priority)}`}>
              {task.priority || 'MEDIUM'}
            </span>

            {task.assigneeId && (
              <div
                title={task.assigneeId.name}
                className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] border border-indigo-400/30 shrink-0"
              >
                {task.assigneeId.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}