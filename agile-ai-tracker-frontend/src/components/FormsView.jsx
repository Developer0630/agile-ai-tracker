import { useState } from 'react';
import axios from 'axios';
import { ClipboardList, Send, Link as LinkIcon, CheckCircle2, Copy } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function FormsView({ projectId, onTaskUpdate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    type: 'FEATURE' // Tạm dùng type để thêm vào title hoặc tags
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      // Đẩy thẳng vào Backlog (không có sprintId)
      await axios.post(`${API_BASE}/tasks`, {
        projectId,
        title: `[${formData.type}] ${formData.title}`,
        description: formData.description,
        priority: formData.priority,
        status: 'TODO',
        sprintId: null 
      });
      
      setShowSuccess(true);
      setFormData({ title: '', description: '', priority: 'MEDIUM', type: 'FEATURE' });
      if (onTaskUpdate) onTaskUpdate();
      
      // Tắt thông báo thành công sau 3 giây
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Lỗi khi gửi yêu cầu!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    // Giả lập copy link form public
    navigator.clipboard.writeText(`https://fjra.io/form/${projectId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl shadow-sm h-full flex flex-col md:flex-row overflow-hidden">
      
      {/* Cột trái: Thông tin Form & Share Link */}
      <div className="w-full md:w-1/3 bg-slate-900/80 border-r border-slate-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Intake Form</h2>
            <p className="text-[11px] text-slate-400">Thu thập yêu cầu dự án</p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <p className="text-xs text-slate-400 leading-relaxed">
            Biểu mẫu này dùng để thu thập các yêu cầu tính năng (Feature Request) hoặc báo cáo lỗi (Bug Report). Yêu cầu sau khi gửi sẽ tự động được thêm vào <strong className="text-slate-200">Product Backlog</strong>.
          </p>

          <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3 mt-6">
            <p className="text-xs font-semibold text-slate-300">Chia sẻ biểu mẫu (Public Link)</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-[10px] text-slate-400 font-mono truncate">
                https://fjra.io/form/{projectId.substring(0, 8)}...
              </div>
              <button 
                onClick={handleCopyLink}
                className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg transition-colors cursor-pointer"
                title="Copy Link"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Khung Submit Form (Preview) */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar flex justify-center bg-[#070A11]">
        <div className="w-full max-w-lg">
          {showSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-400">Gửi yêu cầu thành công!</h3>
              <p className="text-xs text-slate-400">Yêu cầu của bạn đã được ghi nhận vào Product Backlog của dự án.</p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Gửi thêm yêu cầu khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 shadow-xl space-y-5">
              <div className="border-b border-slate-700/60 pb-4 mb-2">
                <h3 className="text-sm font-bold text-slate-200">Gửi Yêu Cầu / Báo Lỗi</h3>
                <p className="text-[11px] text-slate-400 mt-1">Vui lòng điền đầy đủ thông tin chi tiết.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Loại yêu cầu</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="FEATURE">✨ Đề xuất Tính năng</option>
                    <option value="BUG">🐛 Báo cáo Lỗi (Bug)</option>
                    <option value="SUPPORT">❓ Hỗ trợ kỹ thuật</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Độ ưu tiên</label>
                  <select 
                    value={formData.priority} 
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Thấp (Low)</option>
                    <option value="MEDIUM">Trung bình (Medium)</option>
                    <option value="HIGH">Cao (High)</option>
                    <option value="URGENT">Khẩn cấp (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Tiêu đề ngắn gọn <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="VD: Lỗi không thể đăng nhập bằng Google..."
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Mô tả chi tiết</label>
                <textarea 
                  rows={5}
                  placeholder="Mô tả các bước để tái hiện lỗi, hoặc chi tiết tính năng bạn mong muốn..."
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Send className="w-4 h-4" /> Gửi Yêu Cầu</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}