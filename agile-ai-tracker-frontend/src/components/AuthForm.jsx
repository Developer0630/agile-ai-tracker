import { useState } from 'react';
import { FolderKanban, ArrowRight, UserPlus, LogIn, Lock, Mail, User, ShieldCheck } from 'lucide-react';

export default function AuthForm({ mode, loading, onSubmit, onSwitchMode }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-[#070A11] text-slate-100 p-4 relative overflow-hidden">
      {/* Background Glow Decorations */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-1">
            <FolderKanban className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
            {mode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            {mode === 'login' 
              ? 'Nhập thông tin đăng nhập để truy cập FJra Workspace' 
              : 'Trải nghiệm quản lý Sprint & Agile thông minh tích hợp AI'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Họ và tên</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Email</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="developer@fjra.io"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Mật khẩu</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Vai trò</label>
              <div className="relative flex items-center">
                <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer appearance-none"
                >
                  <option value="MEMBER">Developer / Member</option>
                  <option value="PM">Project Manager (PM)</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Đăng nhập
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Tạo tài khoản ngay
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          </span>
          <button
            type="button"
            onClick={onSwitchMode}
            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}