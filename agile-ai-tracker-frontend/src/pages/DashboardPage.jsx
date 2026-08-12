import { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderKanban, Plus, ArrowRight, Layers, Users, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreateProjectModal from '../components/CreateProjectModal'; // Thêm import Modal

const API_BASE = 'http://localhost:5000/api';

export default function DashboardPage({ onSelectProject }) {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State quản lý ẩn/hiện Modal

// 2. Hàm fetchProjects không cần setLoading(true) nữa
const fetchProjects = () => {
  const token = localStorage.getItem('token');
  
  axios.get(`${API_BASE}/projects`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => setProjects(res.data.data || res.data))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
};

// 3. Gọi trong useEffect bình thường
useEffect(() => {
  fetchProjects();
}, []);

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between bg-slate-900/40 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FolderKanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">FJra Workspace</h1>
            <p className="text-[10px] text-slate-400 font-medium">Agile & AI Project Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-200">{user?.name || 'User'}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md font-mono">{user?.role || 'MEMBER'}</span>
          </div>

          <button
            onClick={logout}
            title="Đăng xuất"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-8">
        {/* Banner Welcome */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/30 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Danh sách Dự án</h2>
            <p className="text-xs text-slate-400">Chọn dự án để mở Không gian làm việc (Workspace) và Kanban Sprint</p>
          </div>
          
          {/* Mở Modal khi click vào nút */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Tạo dự án mới
          </button>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-slate-900/40 border border-slate-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-slate-800/50 rounded-2xl space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">Chưa có dự án nào. Hãy tạo dự án đầu tiên!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <div 
                key={p._id || p.id} 
                onClick={() => onSelectProject(p._id || p.id)}
                className="bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl group-hover:scale-105 transition-transform">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">Active</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">{p.name || 'Dự án không tên'}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{p.description || 'Chưa có mô tả chi tiết cho dự án này.'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {p.members?.length || 1}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Sprint
                    </span>
                  </div>
                  <span className="text-indigo-400 font-semibold flex items-center gap-1 text-[11px] group-hover:translate-x-1 transition-transform">
                    Vào Board <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Tạo Dự án Mới */}
      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={fetchProjects} 
      />
    </div>
  );
}