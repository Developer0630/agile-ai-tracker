import { useState } from 'react';
import axios from 'axios';
import { Copy, CheckCircle2 } from 'lucide-react';
import { PageHeader, Panel, Input, Textarea, Select, Button } from './ui';

const API_BASE = 'http://localhost:5000/api';

export default function FormsView({ projectId, onTaskUpdate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    type: 'FEATURE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE}/tasks`, {
        projectId,
        title: `[${formData.type}] ${formData.title}`,
        description: formData.description,
        priority: formData.priority,
        status: 'TODO',
        sprintId: null
      });
      setShowSuccess(true);
      setFormData({ title: '', description: '', priority: 'MEDIUM', type: 'FEATURE' });
      if (onTaskUpdate) onTaskUpdate();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      alert('Lỗi khi gửi yêu cầu!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://fjra.io/form/${projectId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Intake form" description="Submit feature requests and bug reports to the product backlog." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="About" className="lg:col-span-1">
          <p className="text-sm text-[#626F86] mb-4">
            Submissions are added directly to the product backlog for triage.
          </p>
          <div className="border border-[#DFE1E6] rounded-[3px] p-3 bg-[#FAFBFC]">
            <p className="text-xs font-medium text-[#172B4D] mb-2">Public link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] text-[#626F86] truncate bg-white border border-[#DFE1E6] px-2 py-1 rounded-[3px]">
                https://fjra.io/form/{projectId?.substring?.(0, 8)}...
              </code>
              <Button variant="secondary" size="sm" onClick={handleCopyLink} aria-label="Copy link">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00875A]" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel title="Submit request" className="lg:col-span-2">
          {showSuccess ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#00875A] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#172B4D]">Request submitted</p>
              <p className="text-xs text-[#626F86] mt-1">Added to product backlog.</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => setShowSuccess(false)}>Submit another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select label="Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  <option value="FEATURE">Feature request</option>
                  <option value="BUG">Bug report</option>
                  <option value="SUPPORT">Support</option>
                </Select>
                <Select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </Select>
              </div>
              <Input label="Title" type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Brief summary..." />
              <Textarea label="Description" rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Steps to reproduce or feature details..." />
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          )}
        </Panel>
      </div>
    </div>
  );
}
