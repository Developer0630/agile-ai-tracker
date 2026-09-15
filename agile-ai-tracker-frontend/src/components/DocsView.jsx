import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Save, Trash2 } from 'lucide-react';
import { Button, LoadingState, EmptyState, PageHeader } from './ui';

const API_BASE = 'http://localhost:5000/api';

export default function DocsView({ projectId }) {
  const [docs, setDocs] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/docs/project/${projectId}`);
      const data = res.data.data || [];
      setDocs(data);
      if (data.length > 0 && !activeDoc) setActiveDoc(data[0]);
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

  const handleCreateDoc = async () => {
    try {
      const res = await axios.post(`${API_BASE}/docs`, { projectId, title: 'Untitled document', content: '' });
      const newDoc = res.data.data;
      setDocs([newDoc, ...docs]);
      setActiveDoc(newDoc);
    } catch {
      alert('Không thể tạo tài liệu!');
    }
  };

  const handleSaveDoc = async () => {
    if (!activeDoc) return;
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE}/docs/${activeDoc._id}`, { title: activeDoc.title, content: activeDoc.content });
      setDocs(docs.map(d => d._id === activeDoc._id ? res.data.data : d));
    } catch {
      alert('Lỗi khi lưu tài liệu!');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await axios.delete(`${API_BASE}/docs/${id}`);
      const filtered = docs.filter(d => d._id !== id);
      setDocs(filtered);
      if (activeDoc?._id === id) setActiveDoc(filtered.length > 0 ? filtered[0] : null);
    } catch {
      alert('Không thể xóa tài liệu!');
    }
  };

  if (loading) return <LoadingState message="Loading documents..." />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Docs"
        description="Project documentation and notes."
        actions={
          <Button variant="primary" size="sm" onClick={handleCreateDoc}>
            <Plus className="w-3.5 h-3.5" /> New document
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row border border-[#DFE1E6] rounded-[3px] bg-white min-h-[480px] overflow-hidden">
        <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-[#DFE1E6] bg-[#FAFBFC] shrink-0">
          <div className="px-3 py-2 text-xs font-semibold text-[#626F86] border-b border-[#DFE1E6]">
            {docs.length} documents
          </div>
          <div className="max-h-64 md:max-h-none overflow-y-auto">
            {docs.length === 0 ? (
              <p className="text-xs text-[#626F86] p-3">No documents yet.</p>
            ) : (
              docs.map(doc => (
                <div
                  key={doc._id}
                  onClick={() => setActiveDoc(doc)}
                  className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer border-b border-[#DFE1E6] group ${
                    activeDoc?._id === doc._id ? 'bg-[#DEEBFF] text-[#0052CC]' : 'text-[#172B4D] hover:bg-[#F4F5F7]'
                  }`}
                >
                  <span className="truncate flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    {doc.title || 'Untitled'}
                  </span>
                  {activeDoc?._id === doc._id && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc._id); }}
                      className="p-0.5 opacity-0 group-hover:opacity-100 text-[#626F86] hover:text-[#DE350B] cursor-pointer"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {activeDoc ? (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#DFE1E6] bg-[#FAFBFC]">
                <span className="text-xs text-[#626F86]">
                  Updated {new Date(activeDoc.updatedAt).toLocaleDateString('vi-VN')}
                </span>
                <Button variant="secondary" size="sm" onClick={handleSaveDoc} disabled={saving}>
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <input
                  type="text"
                  value={activeDoc.title}
                  onChange={(e) => setActiveDoc({ ...activeDoc, title: e.target.value })}
                  placeholder="Document title"
                  className="w-full text-lg font-semibold text-[#172B4D] border-none outline-none mb-4 bg-transparent"
                />
                <textarea
                  value={activeDoc.content}
                  onChange={(e) => setActiveDoc({ ...activeDoc, content: e.target.value })}
                  placeholder="Start writing..."
                  className="w-full min-h-[360px] text-sm text-[#172B4D] border-none outline-none resize-y bg-transparent leading-relaxed"
                />
              </div>
            </>
          ) : (
            <EmptyState icon={FileText} title="No document selected" description="Select a document or create a new one." actionLabel="New document" onAction={handleCreateDoc} />
          )}
        </div>
      </div>
    </div>
  );
}
