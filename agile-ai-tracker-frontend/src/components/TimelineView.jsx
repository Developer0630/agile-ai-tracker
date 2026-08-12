import { useMemo } from 'react';
import { AlignLeft, Clock, AlertCircle } from 'lucide-react';

export default function TimelineView({ tasks, onOpenTaskModal }) {
  // Tính toán trục thời gian (Timeline Axis)
  const { minDate, totalDays, dates } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      const today = new Date();
      return { minDate: today, maxDate: today, totalDays: 14, dates: Array.from({ length: 14 }).map((_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)) };
    }

    let min = new Date(tasks[0].createdAt);
    let max = new Date(tasks[0].dueDate || tasks[0].createdAt);

    // Tìm ngày nhỏ nhất (bắt đầu sớm nhất) và lớn nhất (kết thúc trễ nhất)
    tasks.forEach(task => {
      const start = new Date(task.createdAt);
      const end = new Date(task.dueDate || task.createdAt);
      if (start < min) min = start;
      if (end > max) max = end;
    });

    // Thêm khoảng đệm (padding) 3 ngày trước và 7 ngày sau cho biểu đồ dễ nhìn
    min = new Date(min.setDate(min.getDate() - 3));
    max = new Date(max.setDate(max.getDate() + 7));

    const days = Math.round((max - min) / (1000 * 60 * 60 * 24)) + 1;
    
    const dateArray = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(min);
      d.setDate(d.getDate() + i);
      dateArray.push(d);
    }

    return { minDate: min, maxDate: max, totalDays: days, dates: dateArray };
  }, [tasks]);

  // Hàm tính toán vị trí và độ dài của thanh Task (Gantt Bar)
  const getTaskStyle = (task) => {
    const start = new Date(task.createdAt);
    let end = new Date(task.dueDate || task.createdAt);
    
    // Nếu chưa set DueDate, mặc định task dài 1 ngày
    if (start.getTime() === end.getTime()) {
       end.setDate(end.getDate() + 1); 
    }

    const leftDiff = Math.round((start - minDate) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

    return {
      left: `${(leftDiff / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DONE': return 'bg-emerald-500 hover:bg-emerald-400';
      case 'IN_PROGRESS': return 'bg-blue-500 hover:bg-blue-400';
      case 'REVIEW': return 'bg-purple-500 hover:bg-purple-400';
      default: return 'bg-slate-600 hover:bg-slate-500';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl shadow-sm h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <AlignLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Timeline Tiến độ</h2>
            <p className="text-[11px] text-slate-400">Gantt Chart tổng quan toàn bộ dự án</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-600" /> To do</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> In Progress</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Done</span>
        </div>
      </div>

      {/* Gantt Chart Area */}
      <div className="flex-1 overflow-auto custom-scrollbar flex bg-slate-950">
        
        {/* Cột trái: Tên Task (Cố định) */}
        <div className="w-64 shrink-0 bg-slate-900/80 border-r border-slate-800 sticky left-0 z-20 flex flex-col">
          <div className="h-10 border-b border-slate-800 flex items-center px-4 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Tên công việc
          </div>
          <div className="flex-1 py-2">
            {tasks.map(task => (
              <div 
                key={task._id || task.id} 
                onClick={() => onOpenTaskModal && onOpenTaskModal(task)}
                className="h-12 px-4 flex items-center border-b border-slate-800/50 hover:bg-slate-800 cursor-pointer group transition-colors"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-slate-200 truncate group-hover:text-indigo-400">{task.title}</span>
                  {!task.dueDate && <span className="text-[9px] text-yellow-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5"/> Chưa có Deadline</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: Lưới thời gian (Cuộn ngang) */}
        <div className="flex-1 min-w-[800px] relative flex flex-col">
          {/* Header Ngày tháng */}
          <div className="h-10 border-b border-slate-800 flex sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm">
            {dates.map((date, i) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div 
                  key={i} 
                  style={{ width: `${(1 / totalDays) * 100}%` }}
                  className={`flex flex-col items-center justify-center border-r border-slate-800/50 shrink-0 ${isToday ? 'bg-indigo-500/10' : ''}`}
                >
                  <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {date.getDate()}/{date.getMonth() + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Lưới Grid và Thanh Tiến độ */}
          <div className="flex-1 relative py-2 bg-[linear-gradient(90deg,_transparent_calc(100%-1px),_rgba(30,41,59,0.5)_100%)]" style={{ backgroundSize: `${(1 / totalDays) * 100}% 100%` }}>
            {/* Đường kẻ mốc "Hôm nay" */}
            {(() => {
              const todayDiff = Math.round((new Date() - minDate) / (1000 * 60 * 60 * 24));
              if (todayDiff >= 0 && todayDiff <= totalDays) {
                return (
                  <div 
                    className="absolute top-0 bottom-0 border-l-2 border-indigo-500/50 z-10 pointer-events-none" 
                    style={{ left: `${(todayDiff / totalDays) * 100}%` }}
                  />
                );
              }
              return null;
            })()}

            {tasks.map(task => (
              <div key={task._id || task.id} className="h-12 relative border-b border-slate-800/10 flex items-center">
                <div 
                  onClick={() => onOpenTaskModal && onOpenTaskModal(task)}
                  className={`absolute h-6 rounded-md shadow-sm cursor-pointer transition-all ${getStatusColor(task.status)} group`}
                  style={getTaskStyle(task)}
                >
                  {/* Tooltip khi hover vào thanh bar */}
                  <div className="absolute -top-8 left-0 hidden group-hover:block whitespace-nowrap bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded shadow-lg z-30">
                    Bắt đầu: {new Date(task.createdAt).toLocaleDateString('vi-VN')} <br/>
                    {task.dueDate ? `Hạn: ${new Date(task.dueDate).toLocaleDateString('vi-VN')}` : 'Chưa có hạn'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}