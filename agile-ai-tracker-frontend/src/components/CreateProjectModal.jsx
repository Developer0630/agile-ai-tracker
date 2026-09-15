import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Users, Check } from 'lucide-react';
import { Modal, Input, Textarea, Button } from './ui';

const API_BASE = 'http://localhost:5000/api';

export default function CreateProjectModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    if (isOpen) {
      axios.get(`${API_BASE}/auth/users`, getAuthHeader())
        .then(res => setAllUsers(res.data.data || []))
        .catch(err => console.error('Lỗi lấy danh sách user:', err));
    }
  }, [isOpen]);

  const toggleMember = (userId) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/projects`,
        { name, description, memberIds: selectedMemberIds },
        getAuthHeader()
      );
      setName('');
      setDescription('');
      setSelectedMemberIds([]);
      onCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo dự án');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create project"
      description="Set up a new project workspace."
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Project name"
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="E-Commerce Web App"
        />
        <Textarea
          label="Description"
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Brief project description..."
        />
        <div>
          <label className="block text-xs font-medium text-[#44546F] mb-1.5 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Invite members
          </label>
          <div className="max-h-36 overflow-y-auto border border-[#DFE1E6] rounded-[3px] divide-y divide-[#DFE1E6]">
            {allUsers.map(u => {
              const isSelected = selectedMemberIds.includes(u._id);
              return (
                <div
                  key={u._id}
                  onClick={() => toggleMember(u._id)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#F4F5F7] ${
                    isSelected ? 'bg-[#DEEBFF]' : ''
                  }`}
                >
                  <div>
                    <div className="text-sm text-[#172B4D]">{u.name}</div>
                    <div className="text-xs text-[#626F86]">{u.email}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#0052CC]" />}
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
