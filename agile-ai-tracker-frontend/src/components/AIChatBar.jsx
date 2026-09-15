import { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Button, Input } from './ui';

const API_BASE = 'http://localhost:5000/api';

export default function AIChatBar({ projectId, onTaskCreated }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await axios.post(`${API_BASE}/ai/parse-task`, {
        projectId,
        prompt
      });

      setSuccessMsg(`Created task: "${res.data.data.title}"`);
      setPrompt('');
      if (onTaskCreated) onTaskCreated();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      alert('AI could not process the request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#DFE1E6] rounded-[3px] px-3 py-2.5 mb-4">
      <form onSubmit={handleAiSubmit} className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1 min-w-0">
          <label className="text-xs text-[#626F86] block mb-1">
            Quick create with AI
          </label>
          <Input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "Fix login UI bug, high priority, due Friday"'
            className="h-8"
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={loading || !prompt.trim()}
          className="sm:mt-5 shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create'}
        </Button>
      </form>
      {successMsg && (
        <p className="text-xs text-[#006644] mt-2">{successMsg}</p>
      )}
    </div>
  );
}
