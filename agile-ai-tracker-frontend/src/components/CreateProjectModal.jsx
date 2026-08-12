import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Users, Check } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function CreateProjectModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy token từ localStorage để truyền Header
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    if (isOpen) {
      // Lấy danh sách User từ Backend
      axios.get(`${API_BASE}/auth/users`, getAuthHeader())
        .then(res => setAllUsers(res.data.data || []))
        .catch(err => console.error('Lỗi lấy danh sách user:', err));
    }
  }, [isOpen]);

  // Toggle chọn/bỏ chọn member
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
      
      // Reset form & đóng modal
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 text-slate-100 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-100">Tạo Dự án mới</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tên dự án *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="VD: E-Commerce Web App"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Mô tả</label>
            <textarea
              rows="2"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="Mô tả ngắn về dự án..."
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Mời thành viên tham gia
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
              {allUsers.map(u => {
                const isSelected = selectedMemberIds.includes(u._id);
                return (
                  <div
                    key={u._id}
                    onClick={() => toggleMember(u._id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-950/60 border border-indigo-500/30' : 'hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-200">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.email}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo dự án'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}