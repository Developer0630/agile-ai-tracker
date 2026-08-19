import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Trash2, Mail } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function MembersView({ projectId, currentUserRole }) {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const canManage = ['ADMIN', 'PM', 'OWNER'].includes(currentUserRole);
  const reloadMembers = () => setReloadTrigger(prev => prev + 1);

  useEffect(() => {
    let isMounted = true;
    const loadProjectMembers = async () => {
      if (!projectId) return;
      try {
        const res = await axios.get(`${API_BASE}/projects/${projectId}/members`, getAuthConfig());
        if (isMounted) {
          setMembers(res.data.data || []);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách thành viên:', err);
      }
    };

    loadProjectMembers();
    return () => { isMounted = false; };
  }, [projectId, reloadTrigger]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/projects/${projectId}/members`, { email, role }, getAuthConfig());
      setEmail('');
      reloadMembers();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể thêm thành viên');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await axios.put(`${API_BASE}/projects/${projectId}/members/${memberId}`, { role: newRole }, getAuthConfig());
      reloadMembers();
    } catch {
      alert('Không thể đổi vai trò');
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) return;
    try {
      await axios.delete(`${API_BASE}/projects/${projectId}/members/${memberId}`, getAuthConfig());
      reloadMembers();
    } catch {
      alert('Lỗi xóa thành viên');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100">
      {/* Form thêm thành viên */}
      {canManage && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-400" /> Thêm thành viên vào dự án
          </h3>
          <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="Nhập email thành viên cần thêm..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
            >
              <option value="MEMBER">Member (Developer / Tester)</option>
              <option value="PM">Project Manager (PM)</option>
              <option value="VIEWER">Viewer (Chỉ xem)</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang thêm...' : 'Mời tham gia'}
            </button>
          </form>
        </div>
      )}

      {/* Danh sách thành viên */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Danh sách thành viên ({members.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-800/60">
          {members.map(m => {
            const u = m.user || {};
            const name = u.name || 'Thành viên';
            const email = u.email || 'Chưa có email';
            const initial = (name.charAt(0) || email.charAt(0) || 'U').toUpperCase();

            return (
              <div key={m._id || u._id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                    {initial}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{name}</div>
                    <div className="text-[11px] text-slate-400">{email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {canManage ? (
                    <select
                      value={m.role || 'MEMBER'}
                      onChange={e => handleRoleChange(m._id, e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="PM">PM</option>
                      <option value="MEMBER">MEMBER</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  ) : (
                    <span className="text-[10px] px-2 py-1 bg-slate-800 rounded text-slate-300 font-semibold uppercase">
                      {m.role || 'MEMBER'}
                    </span>
                  )}

                  {canManage && (
                    <button
                      onClick={() => handleRemove(m._id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}