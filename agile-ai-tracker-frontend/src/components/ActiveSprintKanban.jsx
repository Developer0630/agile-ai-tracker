import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  Plus, 
  MoreHorizontal, 
  User,
  Zap
} from 'lucide-react';

// Dữ liệu mẫu Active Sprint
const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Thiết kế giao diện Dashboard',
    description: 'Tạo UI/UX chuẩn Dark mode cho Active Sprint Kanban Board',
    priority: 'HIGH',
    assignee: 'Lê Văn A',
    status: 'TODO'
  },
  {
    id: 'task-2',
    title: 'Tích hợp API Authentication',
    description: 'Viết Middleware kiểm tra JWT Token và phân quyền',
    priority: 'URGENT',
    assignee: 'Trần Thị B',
    status: 'IN_PROGRESS'
  },
  {
    id: 'task-3',
    title: 'Cấu hình MongoDB Schema',
    description: 'Tạo Collection cho Tasks, Sprints và Projects',
    priority: 'MEDIUM',
    assignee: 'Nguyễn Văn C',
    status: 'DONE'
  }
];

const COLUMNS = [
  { 
    id: 'TODO', 
    title: 'Cần làm', 
    icon: Clock, 
    color: 'text-slate-400', 
    badgeBg: 'bg-slate-800 text-slate-300',
    borderColor: 'border-slate-800'
  },
  { 
    id: 'IN_PROGRESS', 
    title: 'Đang làm', 
    icon: PlayCircle, 
    color: 'text-blue-400', 
    badgeBg: 'bg-blue-500/20 text-blue-400',
    borderColor: 'border-blue-500/20'
  },
  { 
    id: 'DONE', 
    title: 'Hoàn thành', 
    icon: CheckCircle2, 
    color: 'text-emerald-400', 
    badgeBg: 'bg-emerald-500/20 text-emerald-400',
    borderColor: 'border-emerald-500/20'
  }
];

export default function ActiveSprintKanban() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  // Xử lý sự kiện Kéo - Thả
  const handleOnDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId && 
      destination.index === source.index
    ) return;

    const newStatus = destination.droppableId;

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === draggableId ? { ...task, status: newStatus } : task
      )
    );
  };

  // Helper hiển thị Badge Mức độ ưu tiên
  const renderPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">HIGH</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/60 text-slate-300">MEDIUM</span>;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#090D16] text-slate-100 font-sans p-6 overflow-hidden">
      
      {/* Header Active Sprint */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Sprint 24 (Active)
            </span>
            <span className="text-xs text-slate-400">01/08/2026 - 15/08/2026</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Active Sprint Kanban</h1>
        </div>

        <button className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-indigo-600/20 self-start md:self-auto cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Thêm Công Việc</span>
        </button>
      </div>

      {/* Board Kanban 3 Cột */}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0 overflow-x-auto pb-2">
          {COLUMNS.map((col) => {
            const Icon = col.icon;
            const columnTasks = tasks.filter(t => t.status === col.id);

            return (
              <div 
                key={col.id} 
                className={`flex flex-col h-full rounded-xl bg-[#0F172A]/60 border ${col.borderColor} p-3.5 backdrop-blur-md min-w-[280px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${col.color}`} />
                    <h2 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      {col.title}
                    </h2>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${col.badgeBg}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto space-y-3 pr-1 transition-colors rounded-lg ${
                        snapshot.isDraggingOver ? 'bg-slate-800/20' : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/60 hover:border-slate-500 transition-all group ${
                                snapshot.isDragging 
                                  ? 'shadow-xl shadow-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.02]' 
                                  : ''
                              }`}
                            >
                              {/* Task Header */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-medium text-xs text-slate-100 leading-snug">
                                  {task.title}
                                </h3>
                                <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-200 rounded transition-opacity">
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Description */}
                              {task.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                                  {task.description}
                                </p>
                              )}

                              {/* Task Footer */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-[10px]">
                                <div className="flex items-center gap-1.5 text-indigo-300 font-medium bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/50">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span className="truncate max-w-[90px]">{task.assignee}</span>
                                </div>
                                {renderPriorityBadge(task.priority)}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}