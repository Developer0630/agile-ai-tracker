import { useState } from 'react';
import axios from 'axios';
import { Sparkles, Loader2, ArrowUpRight } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function AIChatBar({ projectId, onTaskCreated }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await axios.post(`${API_BASE}/ai/parse-task`, {
        projectId,
        prompt
      });
      
      setSuccessMsg(`✨ Đã tạo task: "${res.data.data.title}" thành công!`);
      setPrompt('');
      if (onTaskCreated) onTaskCreated();
      
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      alert('AI không thể xử lý yêu cầu lúc này. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md mb-6">
      <form onSubmit={handleAiSubmit} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            FJra AI Copilot (Nhập văn bản tự nhiên để tạo Task)
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Ví dụ: &quot;Tạo task sửa lỗi giao diện đăng nhập, gấp, hạn ngày 20/08&quot;
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Bạn muốn AI làm gì cho dự án hôm nay?"
              className="w-full bg-slate-950/80 border border-indigo-500/30 rounded-xl py-3 pl-4 pr-10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
            />
            <button 
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg animate-fade-in">
            {successMsg}
          </div>
        )}
      </form>
    </div>
  );
}