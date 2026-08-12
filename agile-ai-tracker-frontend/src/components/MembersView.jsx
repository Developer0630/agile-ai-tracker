import { Users, Mail, Shield, Trash2 } from 'lucide-react';

export default function MembersView({ projectId }) {
  const members = [
    { name: 'Trần Dev One', email: 'dev1@fjra.io', role: 'ADMIN' },
    { name: 'Nguyen Member', email: 'member@fjra.io', role: 'MEMBER' }
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" /> Thành viên dự án
        </h2>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] px-3 py-1.5 rounded-lg cursor-pointer">
          Mời thành viên
        </button>
      </div>

      <div className="space-y-3">
        {members.map((m, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                {m.name[0]}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">{m.name}</p>
                <p className="text-[10px] text-slate-500">{m.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{m.role}</span>
              <button className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}