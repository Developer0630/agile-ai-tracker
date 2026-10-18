import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Users, FolderKanban, Sliders, ArrowLeft, 
  Trash2, RefreshCw
} from 'lucide-react';
import { 
  Button, Avatar, Table, TableHead, TableHeaderCell, 
  TableBody, TableRow, TableCell
} from '../components/ui';

const API_BASE = 'http://localhost:5000/api';
const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function AdminSettingsPage({ onBack }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'projects' | 'attributes'
  const [loading, setLoading] = useState(true);

  // Data states
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [priorities, setPriorities] = useState([]);

  
  useEffect(() => {
    const loadAdminData = async () => {
    try {
      setLoading(true);
      const [resUsers, resProjects, resSettings] = await Promise.all([
        axios.get(`${API_BASE}/system-settings/users/all`, getAuthConfig()),
        axios.get(`${API_BASE}/system-settings/projects/all`, getAuthConfig()),
        axios.get(`${API_BASE}/system-settings`, getAuthConfig())
      ]);
      setUsers(resUsers.data.data || []);
      setProjects(resProjects.data.data || []);
      setPriorities(resSettings.data.data?.task_priorities || []);
    } catch {
      alert('Không thể tải dữ liệu quản trị viên hoặc phiên đăng nhập hết hạn!');
    } finally {
      setLoading(false);
    }
  };

    loadAdminData();
  }, []);

  // Xử lý đổi quyền User
  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${API_BASE}/system-settings/users/${userId}`, { role: newRole }, getAuthConfig());
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi cập nhật quyền');
    }
  };

  // Xử lý xóa User
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userName}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/system-settings/users/${userId}`, getAuthConfig());
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xóa tài khoản');
    }
  };

  // Xử lý Admin xóa Dự án
  const handleDeleteProject = async (projectId, projName) => {
    if (!window.confirm(`CẢNH BÁO: Bạn đang xóa vĩnh viễn dự án "${projName}" với quyền Admin?`)) return;
    try {
      await axios.delete(`${API_BASE}/system-settings/projects/${projectId}`, getAuthConfig());
      setProjects(projects.filter(p => (p._id || p.id) !== projectId));
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xóa dự án');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col font-sans">
      {/* Header */}
      <header className="h-14 px-6 bg-white border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="subtle" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
          </Button>
          <div className="h-5 w-[1px] bg-[#DFE1E6]" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FF8B00]" />
            <h1 className="text-sm font-bold text-[#172B4D] uppercase tracking-wide">Trung tâm Quản trị Toàn cục (System Admin)</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#FFF0B3] text-[#172B4D] px-2.5 py-1 rounded font-medium border border-[#FFE380]">
            Super Admin
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex gap-6">
        {/* Sidebar Tabs */}
        <aside className="w-60 space-y-1 shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[3px] text-xs font-semibold transition cursor-pointer ${
              activeTab === 'users' ? 'bg-[#E9F2FF] text-[#0052CC]' : 'text-[#44546F] hover:bg-[#F1F2F4]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản lý Tài khoản ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[3px] text-xs font-semibold transition cursor-pointer ${
              activeTab === 'projects' ? 'bg-[#E9F2FF] text-[#0052CC]' : 'text-[#44546F] hover:bg-[#F1F2F4]'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Quản lý Dự án ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('attributes')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[3px] text-xs font-semibold transition cursor-pointer ${
              activeTab === 'attributes' ? 'bg-[#E9F2FF] text-[#0052CC]' : 'text-[#44546F] hover:bg-[#F1F2F4]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Thuộc tính & Quyền hạn</span>
          </button>
        </aside>

        {/* Content Box */}
        <main className="flex-1 bg-white border border-[#DFE1E6] rounded-[3px] p-6 shadow-sm min-w-0">
          {loading ? (
            <div className="py-20 flex justify-center text-[#626F86]">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Đang đồng bộ dữ liệu quản trị...
            </div>
          ) : activeTab === 'users' ? (
            /* TAB 1: QUẢN LÝ TÀI KHOẢN */
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#172B4D]">Danh sách Tài khoản Hệ thống</h2>
                <p className="text-xs text-[#626F86]">Phân cấp vai trò và kiểm soát tài khoản người dùng trong FJra.</p>
              </div>

              <Table>
                <TableHead>
                  <TableHeaderCell>Người dùng</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Vai trò Hệ thống (System Role)</TableHeaderCell>
                  <TableHeaderCell>Ngày tham gia</TableHeaderCell>
                  <TableHeaderCell className="text-right">Hành động</TableHeaderCell>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Avatar name={u.name} size="sm" />
                        <span>{u.name}</span>
                      </TableCell>
                      <TableCell className="text-[#626F86] text-xs font-mono">{u.email}</TableCell>
                      <TableCell>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] px-2 py-1 text-xs text-[#172B4D] font-medium outline-none focus:border-[#0052CC]"
                        >
                          <option value="ADMIN">ADMIN (Quản trị viên)</option>
                          <option value="PM">PM (Quản lý dự án)</option>
                          <option value="MEMBER">MEMBER (Thành viên)</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-[#626F86] text-xs">
                        {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 text-[#626F86] hover:text-[#DE350B] hover:bg-[#FFEBE6] rounded transition cursor-pointer"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : activeTab === 'projects' ? (
            /* TAB 2: QUẢN LÝ TẤT CẢ DỰ ÁN */
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#172B4D]">Tất cả Dự án trong Hệ thống</h2>
                <p className="text-xs text-[#626F86]">Toàn quyền truy cập, giám sát và can thiệp vào bất kỳ dự án nào.</p>
              </div>

              <Table>
                <TableHead>
                  <TableHeaderCell>Dự án</TableHeaderCell>
                  <TableHeaderCell>Key</TableHeaderCell>
                  <TableHeaderCell>Chủ sở hữu (Owner)</TableHeaderCell>
                  <TableHeaderCell>Số thành viên</TableHeaderCell>
                  <TableHeaderCell className="text-right">Xóa dự án</TableHeaderCell>
                </TableHead>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p._id || p.id}>
                      <TableCell className="font-semibold text-[#172B4D]">{p.name}</TableCell>
                      <TableCell className="font-mono text-xs text-[#0052CC]">{p.key || '—'}</TableCell>
                      <TableCell className="text-[#626F86] text-xs">
                        {p.owner?.name || p.owner?.email || 'Hệ thống'}
                      </TableCell>
                      <TableCell className="text-[#626F86] text-xs">{p.members?.length || 1}</TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleDeleteProject(p._id || p.id, p.name)}
                          className="p-1.5 text-[#626F86] hover:text-[#DE350B] hover:bg-[#FFEBE6] rounded transition cursor-pointer"
                          title="Xóa dự án vĩnh viễn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* TAB 3: THUỘC TÍNH */
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#172B4D]">Cấu hình Mức độ Ưu tiên (Priority Attributes)</h2>
                <p className="text-xs text-[#626F86]">Các nhãn ưu tiên toàn cục áp dụng cho mọi dự án.</p>
              </div>

              <div className="space-y-2 max-w-md">
                {priorities.map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-2.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded">
                    <span className="font-mono text-xs font-bold text-[#172B4D]">{item.key}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}