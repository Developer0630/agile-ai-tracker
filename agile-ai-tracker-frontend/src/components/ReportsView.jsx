import { BarChart2, TrendingUp, AlertOctagon, CheckCircle } from 'lucide-react';

export default function ReportsView({ projectId }) {
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-bold text-white flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-indigo-400" /> Báo cáo dự án
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Task Hoàn thành', val: '85%', icon: CheckCircle, color: 'text-emerald-400' },
          { title: 'Tốc độ Sprint', val: '12 pts', icon: TrendingUp, color: 'text-blue-400' },
          { title: 'Task bị chặn', val: '2', icon: AlertOctagon, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
            <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
            <p className="text-[10px] text-slate-400 uppercase">{stat.title}</p>
            <h3 className="text-xl font-bold text-white">{stat.val}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}