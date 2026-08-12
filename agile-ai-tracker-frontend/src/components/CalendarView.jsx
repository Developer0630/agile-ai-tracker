import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarView({ tasks, onOpenTaskModal }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // Tạo đầy đủ 42 ô lịch (6 hàng x 7 cột)
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

  const totalDaysDisplayed = 42;
  const nextMonthDays = Array.from({ length: totalDaysDisplayed - (prevMonthDays.length + currentMonthDays.length) }).map((_, i) => ({
    day: i + 1,
    isCurrentMonth: false,
    dateObj: new Date(year, month + 1, i + 1)
  }));

  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  const getTasksForDay = (dateObj) => tasks.filter(t => {
    const d = new Date(t.dueDate || t.createdAt);
    return d.getDate() === dateObj.getDate() && 
           d.getMonth() === dateObj.getMonth() && 
           d.getFullYear() === dateObj.getFullYear();
  });

  return (
    // Sửa từ min-h-[650px] thành h-full để khớp tuyệt đối với vùng chứa MainApp
    <div className="flex flex-col h-full bg-[#070A11] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-[#090D16] shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><CalendarIcon size={16} /></div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {currentDate.toLocaleString('vi-VN', { month: 'long' })} {year}
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"><ChevronLeft size={16} /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 text-[10px] font-bold text-slate-400 hover:text-indigo-400 cursor-pointer">TODAY</button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Grid Lịch bao gồm Tiêu đề Thứ và 6 hàng ngày */}
      <div className="flex-1 grid grid-cols-7 grid-rows-[36px_repeat(6,1fr)] gap-px bg-slate-800/30 min-h-0">
        {/* Tên các thứ trong tuần */}
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
          <div key={d} className="flex items-center justify-center text-[10px] font-bold text-slate-500 bg-[#090D16] uppercase tracking-widest border-b border-slate-800/50">
            {d}
          </div>
        ))}

        {/* Các ô ngày */}
        {allDays.map((item, i) => {
          const dayTasks = getTasksForDay(item.dateObj);
          const isToday = item.dateObj.toDateString() === new Date().toDateString();

          return (
            <div key={i} className={`p-2 transition-all flex flex-col overflow-hidden ${item.isCurrentMonth ? 'bg-[#070A11]' : 'bg-[#05070B] opacity-40'}`}>
              <div className="flex justify-between items-center mb-1 shrink-0">
                <span className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-md ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}>
                  {item.day}
                </span>
              </div>
              
              <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                {dayTasks.map(task => (
                  <button 
                    key={task._id}
                    onClick={() => onOpenTaskModal(task)}
                    className="w-full text-[9px] text-left px-2 py-1 bg-slate-800/60 hover:bg-indigo-900/40 text-slate-300 border-l-2 border-indigo-500 rounded truncate transition-all cursor-pointer"
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}