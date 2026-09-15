import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2 } from 'lucide-react';
import { Button, Input, Select, PageHeader, Panel, Avatar, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from './ui';

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
        if (isMounted) setMembers(res.data.data || []);
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
    if (!window.confirm('Remove this member?')) return;
    try {
      await axios.delete(`${API_BASE}/projects/${projectId}/members/${memberId}`, getAuthConfig());
      reloadMembers();
    } catch {
      alert('Lỗi xóa thành viên');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Members" description="Manage project team and permissions." />

      {canManage && (
        <Panel title="Add member">
          <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-2">
            <Input type="email" required placeholder="member@company.com" value={email} onChange={e => setEmail(e.target.value)} className="flex-1" />
            <Select value={role} onChange={e => setRole(e.target.value)} className="sm:w-40">
              <option value="MEMBER">Member</option>
              <option value="PM">Project Manager</option>
              <option value="VIEWER">Viewer</option>
            </Select>
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              <UserPlus className="w-3.5 h-3.5" /> {loading ? 'Adding...' : 'Invite'}
            </Button>
          </form>
        </Panel>
      )}

      <Table>
        <TableHead>
          <TableHeaderCell>Member</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          {canManage && <TableHeaderCell className="w-12" />}
        </TableHead>
        <TableBody>
          {members.map(m => {
            const u = m.user || {};
            const name = u.name || 'Member';
            const memberEmail = u.email || '—';
            return (
              <TableRow key={m._id || u._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar name={name} size="sm" />
                    <span className="font-medium">{name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[#626F86]">{memberEmail}</TableCell>
                <TableCell>
                  {canManage ? (
                    <Select value={m.role || 'MEMBER'} onChange={e => handleRoleChange(m._id, e.target.value)} className="h-7 text-xs w-32">
                      <option value="ADMIN">Admin</option>
                      <option value="PM">PM</option>
                      <option value="MEMBER">Member</option>
                      <option value="VIEWER">Viewer</option>
                    </Select>
                  ) : (
                    <span className="text-xs text-[#626F86]">{m.role || 'MEMBER'}</span>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <button type="button" onClick={() => handleRemove(m._id)} className="p-1 text-[#626F86] hover:text-[#DE350B] cursor-pointer" aria-label="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
