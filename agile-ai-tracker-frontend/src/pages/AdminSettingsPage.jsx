import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Users, FolderKanban, ArrowLeft, RefreshCw, KeyRound, Lock, Unlock, UserCheck, 
} from 'lucide-react';
import { 
  Button, Avatar, Table, TableHead, TableHeaderCell, 
  TableBody, TableRow, TableCell, 
} from '../components/ui';

const API_BASE = 'http://localhost:5000/api';
const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function AdminSettingsPage({ onBack }) {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [, setPriorities] = useState([]);

  const loadAdminData = useCallback(async () => {
  try {
    const [resUsers, resProjects, resSettings] = await Promise.all([
      axios.get(`${API_BASE}/system-settings/users/all`, getAuthConfig()),
      axios.get(`${API_BASE}/system-settings/projects/all`, getAuthConfig()),
      axios.get(`${API_BASE}/system-settings`, getAuthConfig())
    ]);

    setUsers(resUsers.data.data || []);
    setProjects(resProjects.data.data || []);
    setPriorities(resSettings.data.data?.task_priorities || []);
  } catch (error) {
    console.error('Lỗi tải dữ liệu quản trị:', error);
    alert('Không thể tải dữ liệu quản trị viên!');
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
  let isMounted = true;

  const initData = async () => {
    await loadAdminData();
  };

  initData();

  return () => {
    isMounted = false;
  };
}, [loadAdminData]);

  // Khóa / Mở khóa tài khoản
  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const actionText = nextStatus === 'SUSPENDED' ? 'tạm khóa' : 'mở khóa';
    
    if (!window.confirm(`Bạn có chắc muốn ${actionText} tài khoản "${user.name}"?`)) return;

    try {
      await axios.put(`${API_BASE}/system-settings/users/${user._id}/status`, { status: nextStatus }, getAuthConfig());
      setUsers(users.map(u => u._id === user._id ? { ...u, status: nextStatus } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi thao tác');
    }
  };

  // Đặt lại mật khẩu cho User
  const handleResetPassword = async (userId, userName) => {
    const customPass = prompt(`Nhập mật khẩu mới cho ${userName}:`, 'FJra@123456');
    if (!customPass) return;

    try {
      const res = await axios.put(`${API_BASE}/system-settings/users/${userId}/reset-password`, { newPassword: customPass }, getAuthConfig());
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi đặt lại mật khẩu');
    }
  };

  // Chuyển quyền Owner dự án
  const handleTransferOwner = async (projectId, projName, currentOwnerId) => {
    const newOwnerId = prompt(`Nhập ID hoặc chọn User mới làm Owner cho dự án "${projName}":`);
    if (!newOwnerId || newOwnerId === currentOwnerId) return;

    try {
      const res = await axios.put(`${API_BASE}/system-settings/projects/${projectId}/transfer-owner`, { newOwnerId }, getAuthConfig());
      alert(res.data.message);
      loadAdminData(); // Tải lại danh sách dự án
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi chuyển giao dự án');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col font-sans">
      <header className="h-14 px-6 bg-white border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="subtle" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại Dashboard
          </Button>
          <div className="h-5 w-[1px] bg-[#DFE1E6]" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FF8B00]" />
            <h1 className="text-sm font-bold text-[#172B4D] uppercase tracking-wide">Trung tâm Quản trị Toàn cục (System Admin)</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex gap-6">
        <aside className="w-64 space-y-1 shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[3px] text-xs font-semibold cursor-pointer transition ${
              activeTab === 'users' ? 'bg-[#E9F2FF] text-[#0052CC]' : 'text-[#44546F] hover:bg-[#F1F2F4]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản lý Tài khoản ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[3px] text-xs font-semibold cursor-pointer transition ${
              activeTab === 'projects' ? 'bg-[#E9F2FF] text-[#0052CC]' : 'text-[#44546F] hover:bg-[#F1F2F4]'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Quản lý Dự án ({projects.length})</span>
          </button>
        </aside>

        <main className="flex-1 bg-white border border-[#DFE1E6] rounded-[3px] p-6 shadow-sm min-w-0">
          {loading ? (
            <div className="py-20 flex justify-center text-[#626F86]">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Đang tải dữ liệu...
            </div>
          ) : activeTab === 'users' ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#172B4D]">Danh sách Tài khoản & Trạng thái Hoạt động</h2>
                <p className="text-xs text-[#626F86]">Tạm khóa, reset mật khẩu và chỉ định vai trò cho từng thành viên.</p>
              </div>

              <Table>
                <TableHead>
                  <TableHeaderCell>Người dùng</TableHeaderCell>
                  <TableHeaderCell>Trạng thái</TableHeaderCell>
                  <TableHeaderCell>Vai trò</TableHeaderCell>
                  <TableHeaderCell className="text-right">Công cụ Quản trị</TableHeaderCell>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <div className="text-xs text-[#172B4D] font-semibold">{u.name}</div>
                          <div className="text-[11px] text-[#626F86] font-mono">{u.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          u.status === 'SUSPENDED' ? 'bg-[#FFEBE6] text-[#DE350B]' : 'bg-[#E3FCEF] text-[#006644]'
                        }`}>
                          {u.status || 'ACTIVE'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[#172B4D] font-mono font-medium">{u.role}</span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'SUSPENDED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          {u.status === 'SUSPENDED' ? (
                            <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                          )}
                        </Button>
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => handleResetPassword(u._id, u.name)}
                          title="Đặt lại mật khẩu"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : activeTab === 'projects' ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#172B4D]">Quản trị Chủ sở hữu Dự án (Project Ownership)</h2>
                <p className="text-xs text-[#626F86]">Chuyển giao quyền quản lý cao nhất hoặc giải tán các dự án không hoạt động.</p>
              </div>

              <Table>
                <TableHead>
                  <TableHeaderCell>Dự án</TableHeaderCell>
                  <TableHeaderCell>Key</TableHeaderCell>
                  <TableHeaderCell>Chủ sở hữu hiện tại</TableHeaderCell>
                  <TableHeaderCell className="text-right">Chuyển nhượng Owner</TableHeaderCell>
                </TableHead>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p._id || p.id}>
                      <TableCell className="font-semibold text-[#172B4D]">{p.name}</TableCell>
                      <TableCell className="font-mono text-xs text-[#0052CC]">{p.key || '—'}</TableCell>
                      <TableCell className="text-xs text-[#172B4D]">
                        {p.owner?.name || p.owner?.email || 'Chưa gán'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => handleTransferOwner(p._id || p.id, p.name, p.owner?._id)}
                          className="text-[#0052CC] hover:bg-[#E9F2FF] text-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" /> Đổi Owner
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}