import { useState } from 'react';
import axios from 'axios';
import { FolderKanban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { user, token } = res.data.data || res.data;
      login(user, token);
    } catch (err) {
      alert(err.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-full bg-[#090D16] text-slate-100">
      <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-sm space-y-4 shadow-2xl">
        <div className="flex items-center gap-3 justify-center mb-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
            <FolderKanban className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white">FJra Tracker</h1>
        </div>
        <p className="text-xs text-slate-400 text-center">Đăng nhập để quản lý công việc và Sprint</p>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white cursor-pointer transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang xác thực...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}