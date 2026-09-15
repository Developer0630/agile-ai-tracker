import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, Button } from './ui';

export default function CalendarView({ tasks, onOpenTaskModal }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthDays = Array.from({ length: firstDay }).map((_, i) => ({
    day: daysInPrevMonth - firstDay + i + 1,
    isCurrentMonth: false,
    dateObj: new Date(year, month - 1, daysInPrevMonth - firstDay + i + 1)
  }));
  const currentMonthDays = Array.from({ length: daysInMonth }).map((_, i) => ({
    day: i + 1,
    isCurrentMonth: true,
    dateObj: new Date(year, month, i + 1)
  }));
  const nextMonthDays = Array.from({ length: 42 - (prevMonthDays.length + daysInMonth) }).map((_, i) => ({
    day: i + 1,
    isCurrentMonth: false,
    dateObj: new Date(year, month + 1, i + 1)
  }));
  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  const getTasksForDay = (dateObj) => tasks.filter(t => {
    const d = new Date(t.dueDate || t.createdAt);
    return d.getDate() === dateObj.getDate() && d.getMonth() === dateObj.getMonth() && d.getFullYear() === dateObj.getFullYear();
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title={currentDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
        description="Tasks by due date"
        actions={
          <div className="flex items-center gap-1 border border-[#DFE1E6] rounded-[3px] bg-white">
            <Button variant="subtle" size="sm" onClick={() => setCurrentDate(new Date(year, month - 1))} aria-label="Previous month">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="subtle" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
            <Button variant="subtle" size="sm" onClick={() => setCurrentDate(new Date(year, month + 1))} aria-label="Next month">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      <div className="bg-white border border-[#DFE1E6] rounded-[3px] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#DFE1E6] bg-[#F4F5F7]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="px-2 py-2 text-xs font-semibold text-[#626F86] text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {allDays.map((item, i) => {
            const dayTasks = getTasksForDay(item.dateObj);
            const isToday = item.dateObj.toDateString() === new Date().toDateString();
            return (
              <div
                key={i}
                className={`min-h-[88px] p-1.5 border-r border-b border-[#DFE1E6] ${item.isCurrentMonth ? 'bg-white' : 'bg-[#FAFBFC] opacity-60'}`}
              >
                <span className={`inline-flex w-6 h-6 items-center justify-center text-xs rounded-[3px] ${
                  isToday ? 'bg-[#0052CC] text-white font-semibold' : 'text-[#626F86]'
                }`}>
                  {item.day}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayTasks.slice(0, 3).map(task => (
                    <button
                      key={task._id || task.id}
                      type="button"
                      onClick={() => onOpenTaskModal(task)}
                      className="w-full text-left text-[11px] px-1 py-0.5 bg-[#DEEBFF] text-[#0052CC] rounded-[3px] truncate hover:bg-[#B3D4FF] cursor-pointer"
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-[#626F86] px-1">+{dayTasks.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
