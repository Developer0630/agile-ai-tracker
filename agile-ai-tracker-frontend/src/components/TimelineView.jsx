import { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { PageHeader, EmptyState } from './ui';

export default function TimelineView({ tasks, onOpenTaskModal }) {
  const { minDate, totalDays, dates } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      const today = new Date();
      return {
        minDate: today,
        totalDays: 14,
        dates: Array.from({ length: 14 }).map((_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i))
      };
    }
    let min = new Date(tasks[0].createdAt);
    let max = new Date(tasks[0].dueDate || tasks[0].createdAt);
    tasks.forEach(task => {
      const start = new Date(task.createdAt);
      const end = new Date(task.dueDate || task.createdAt);
      if (start < min) min = start;
      if (end > max) max = end;
    });
    min = new Date(min.setDate(min.getDate() - 3));
    max = new Date(max.setDate(max.getDate() + 7));
    const days = Math.round((max - min) / (1000 * 60 * 60 * 24)) + 1;
    const dateArray = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(min);
      d.setDate(d.getDate() + i);
      dateArray.push(d);
    }
    return { minDate: min, totalDays: days, dates: dateArray };
  }, [tasks]);

  const getTaskStyle = (task) => {
    const start = new Date(task.createdAt);
    let end = new Date(task.dueDate || task.createdAt);
    if (start.getTime() === end.getTime()) end.setDate(end.getDate() + 1);
    const leftDiff = Math.round((start - minDate) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    return { left: `${(leftDiff / totalDays) * 100}%`, width: `${(duration / totalDays) * 100}%` };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DONE': return 'bg-[#00875A]';
      case 'IN_PROGRESS': return 'bg-[#0052CC]';
      case 'REVIEW': return 'bg-[#6554C0]';
      default: return 'bg-[#C1C7D0]';
    }
  };

  if (!tasks?.length) {
    return (
      <div>
        <PageHeader title="Timeline" description="Gantt view of project tasks." />
        <EmptyState title="No tasks" description="Create tasks to see them on the timeline." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Timeline"
        description="Gantt view of project tasks."
        actions={
          <div className="flex items-center gap-3 text-xs text-[#626F86]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#C1C7D0] rounded-[2px]" /> To do</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#0052CC] rounded-[2px]" /> In progress</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#00875A] rounded-[2px]" /> Done</span>
          </div>
        }
      />

      <div className="bg-white border border-[#DFE1E6] rounded-[3px] overflow-auto custom-scrollbar">
        <div className="flex min-w-[800px]">
          <div className="w-56 shrink-0 border-r border-[#DFE1E6] sticky left-0 bg-white z-10">
            <div className="h-9 px-3 flex items-center text-xs font-semibold text-[#626F86] border-b border-[#DFE1E6] bg-[#F4F5F7]">Issue</div>
            {tasks.map(task => (
              <div
                key={task._id || task.id}
                onClick={() => onOpenTaskModal?.(task)}
                className="h-10 px-3 flex items-center border-b border-[#DFE1E6] hover:bg-[#F4F5F7] cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="text-xs text-[#172B4D] truncate">{task.title}</p>
                  {!task.dueDate && (
                    <p className="text-[10px] text-[#974F0C] flex items-center gap-0.5"><AlertCircle className="w-2.5 h-2.5" /> No due date</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            <div className="h-9 flex border-b border-[#DFE1E6] bg-[#F4F5F7] sticky top-0 z-10">
              {dates.map((date, i) => (
                <div key={i} style={{ width: `${(1 / totalDays) * 100}%` }} className="flex items-center justify-center text-[10px] text-[#626F86] border-r border-[#DFE1E6] shrink-0">
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
              ))}
            </div>
            {tasks.map(task => (
              <div key={task._id || task.id} className="h-10 relative border-b border-[#DFE1E6]">
                <div
                  onClick={() => onOpenTaskModal?.(task)}
                  className={`absolute top-2 h-5 rounded-[3px] cursor-pointer ${getStatusColor(task.status)} opacity-90 hover:opacity-100`}
                  style={getTaskStyle(task)}
                  title={task.title}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
