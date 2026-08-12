import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Save, Trash2, AlignLeft, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function DocsView({ projectId }) {
  const [docs, setDocs] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch danh sách tài liệu
  const fetchDocs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/docs/project/${projectId}`);
      const data = res.data.data || [];
      setDocs(data);
      if (data.length > 0 && !activeDoc) {
        setActiveDoc(data[0]);
      }
    } catch (error) {
      console.error('Lỗi tải Docs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchDocs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Tạo tài liệu mới
  const handleCreateDoc = async () => {
    try {
      const res = await axios.post(`${API_BASE}/docs`, {
        projectId,
        title: 'Tài liệu không tên',
        content: ''
      });
      const newDoc = res.data.data;
      setDocs([newDoc, ...docs]);
      setActiveDoc(newDoc);
    } catch (error) {
      alert('Không thể tạo tài liệu!');
    }
  };

  // Lưu tài liệu
  const handleSaveDoc = async () => {
    if (!activeDoc) return;
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE}/docs/${activeDoc._id}`, {
        title: activeDoc.title,
        content: activeDoc.content
      });
      
      // Cập nhật lại list docs
      setDocs(docs.map(d => d._id === activeDoc._id ? res.data.data : d));
    } catch (error) {
      alert('Lỗi khi lưu tài liệu!');
    } finally {
      setSaving(false);
    }
  };

  // Xóa tài liệu
  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      await axios.delete(`${API_BASE}/docs/${id}`);
      const filtered = docs.filter(d => d._id !== id);
      setDocs(filtered);
      if (activeDoc?._id === id) {
        setActiveDoc(filtered.length > 0 ? filtered[0] : null);
      }
    } catch (error) {
      alert('Không thể xóa tài liệu!');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20 text-slate-400 text-xs">Đang tải tài liệu...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-160px)] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      
      {/* Sidebar: Danh sách Document */}
      <div className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Tài liệu ({docs.length})
          </h3>
          <button 
            onClick={handleCreateDoc}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {docs.length === 0 ? (
            <p className="text-[11px] text-slate-500 text-center py-4">Chưa có tài liệu nào.</p>
          ) : (
            docs.map(doc => (
              <div 
                key={doc._id}
                onClick={() => setActiveDoc(doc)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors group ${
                  activeDoc?._id === doc._id ? 'bg-indigo-600/15 text-indigo-300' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <AlignLeft className="w-4 h-4 shrink-0 opacity-70" />
                  <span className="text-xs font-medium truncate">{doc.title || 'Tài liệu không tên'}</span>
                </div>
                {activeDoc?._id === doc._id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc._id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded-md transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor (Notion Style) */}
      <div className="flex-1 flex flex-col bg-[#070A11] relative">
        {activeDoc ? (
          <>
            {/* Thanh công cụ Editor */}
            <div className="h-14 flex justify-end items-center px-6 border-b border-slate-800/60 bg-slate-900/40">
              <span className="text-[10px] text-slate-500 mr-4 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 
                Cập nhật lần cuối: {new Date(activeDoc.updatedAt).toLocaleDateString('vi-VN')}
              </span>
              <button
                onClick={handleSaveDoc}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm border border-slate-700 hover:border-indigo-500"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Đang lưu...' : 'Lưu tài liệu'}
              </button>
            </div>

            {/* Vùng soạn thảo */}
            <div className="flex-1 overflow-y-auto px-10 py-12 custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Tiêu đề lớn (Notion Style) */}
                <input
                  type="text"
                  value={activeDoc.title}
                  onChange={(e) => setActiveDoc({ ...activeDoc, title: e.target.value })}
                  placeholder="Tiêu đề tài liệu..."
                  className="w-full text-4xl font-black bg-transparent text-slate-100 placeholder-slate-700 border-none outline-none focus:ring-0"
                />
                
                {/* Nội dung */}
                <textarea
                  value={activeDoc.content}
                  onChange={(e) => setActiveDoc({ ...activeDoc, content: e.target.value })}
                  placeholder="Bắt đầu gõ nội dung tại đây..."
                  className="w-full min-h-[500px] bg-transparent text-sm text-slate-300 placeholder-slate-700 border-none outline-none focus:ring-0 resize-none leading-relaxed"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <FileText className="w-16 h-16 opacity-20" />
            <p className="text-sm">Chọn một tài liệu để xem hoặc tạo mới.</p>
          </div>
        )}
      </div>
    </div>
  );
}