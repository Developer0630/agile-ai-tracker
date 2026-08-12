import { Settings, Save } from 'lucide-react';

export default function SettingsView({ projectId }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl">
      <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-6">
        <Settings className="w-4 h-4 text-indigo-400" /> Cài đặt dự án
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold">Tên dự án</label>
          <input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 mt-1 text-xs text-white outline-none focus:border-indigo-500" defaultValue="FJra Workspace" />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold">Mô tả</label>
          <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 mt-1 text-xs text-white outline-none focus:border-indigo-500 h-24" />
        </div>
        
        <div className="pt-4 flex justify-between items-center border-t border-slate-800">
          <button className="text-[10px] text-red-400 hover:text-red-300 font-semibold cursor-pointer">Xóa dự án này</button>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer">
            <Save size={14} /> Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}