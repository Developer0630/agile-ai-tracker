import { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderKanban, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreateProjectModal from '../components/CreateProjectModal';
import {
  Button, Avatar, PageHeader, LoadingState, EmptyState,
  Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, StatusBadge
} from '../components/ui';

const API_BASE = 'http://localhost:5000/api';

export default function DashboardPage({ onSelectProject }) {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = () => {
    const token = localStorage.getItem('token');
    axios.get(`${API_BASE}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProjects(res.data.data || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      <header className="h-12 px-4 sm:px-6 flex items-center justify-between bg-white border-b border-[#DFE1E6] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[3px] bg-[#0052CC] flex items-center justify-center">
            <FolderKanban className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-[#172B4D]">FJra</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Avatar name={user?.name || user?.email} size="sm" />
            <span className="text-xs text-[#172B4D] font-medium">{user?.name || 'User'}</span>
          </div>
          <Button variant="subtle" size="sm" onClick={logout} aria-label="Sign out">
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        <PageHeader
          title="Projects"
          description="Select a project to open its workspace."
          actions={
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              Create project
            </Button>
          }
        />

        {loading ? (
          <LoadingState message="Loading projects..." />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to start tracking work."
            actionLabel="Create project"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <Table>
            <TableHead>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>Key</TableHeaderCell>
              <TableHeaderCell>Members</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="hidden md:table-cell">Description</TableHeaderCell>
            </TableHead>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p._id || p.id} onClick={() => onSelectProject(p._id || p.id)}>
                  <TableCell className="font-medium">{p.name || 'Untitled project'}</TableCell>
                  <TableCell className="text-[#626F86] font-mono text-xs">{p.key || '—'}</TableCell>
                  <TableCell className="text-[#626F86]">{p.members?.length || 1}</TableCell>
                  <TableCell><StatusBadge status="ACTIVE" /></TableCell>
                  <TableCell className="hidden md:table-cell text-[#626F86] text-xs max-w-xs truncate">
                    {p.description || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={fetchProjects}
      />
    </div>
  );
}
