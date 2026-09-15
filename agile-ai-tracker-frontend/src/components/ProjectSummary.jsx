import { useState, useMemo } from 'react';
import axios from 'axios';
import { ShieldAlert, Clock } from 'lucide-react';
import { Button, PageHeader, Panel } from './ui';

const API_BASE = 'http://localhost:5000/api';

export default function ProjectSummary({ tasks = [], project }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAiCard, setShowAiCard] = useState(true);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'DONE').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const todo = tasks.filter(t => t.status === 'TODO').length;
    const blockedTasks = tasks.filter(t => t.isBlocked);
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE');

    const workloadMap = {};
    tasks.forEach(t => {
      const name = t.assignee?.name || t.assignee?.email || t.assigneeId?.name || 'Unassigned';
      if (!workloadMap[name]) workloadMap[name] = { total: 0, done: 0, inProgress: 0, todo: 0 };
      workloadMap[name].total += 1;
      if (t.status === 'DONE') workloadMap[name].done += 1;
      else if (t.status === 'IN_PROGRESS') workloadMap[name].inProgress += 1;
      else workloadMap[name].todo += 1;
    });

    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, inProgress, todo, blockedTasks, overdueTasks, workloadMap, progress };
  }, [tasks]);

  const handleRunAiAudit = async () => {
    setAnalyzing(true);
    try {
      const res = await axios.post(`${API_BASE}/ai/project-health-check`, {
        projectName: project?.name,
        stats: {
          total: stats.total,
          progress: `${stats.progress}%`,
          blockedCount: stats.blockedTasks.length,
          overdueCount: stats.overdueTasks.length,
          urgentCount: tasks.filter(t => ['URGENT', 'HIGH'].includes(t.priority)).length,
          blockedReasons: stats.blockedTasks.map(t => `${t.title}: ${t.blockerReason || 'Unknown'}`),
        }
      });
      setAiAnalysis(res.data.data?.analysis || res.data.analysis);
    } catch {
      setAiAnalysis('Unable to connect to analysis service.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Project overview"
        description={`${stats.progress}% complete · ${stats.blockedTasks.length} blocked · ${stats.overdueTasks.length} overdue`}
        actions={
          <Button variant="secondary" size="sm" onClick={handleRunAiAudit} disabled={analyzing}>
            {analyzing ? 'Analyzing...' : 'Run analysis'}
          </Button>
        }
      />

      {aiAnalysis && showAiCard && (
        <Panel title="Project analysis">
          <p className="text-sm text-[#44546F] whitespace-pre-line">{aiAnalysis}</p>
          <button type="button" onClick={() => setShowAiCard(false)} className="text-xs text-[#626F86] hover:text-[#172B4D] mt-2 cursor-pointer">Dismiss</button>
        </Panel>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Progress', value: `${stats.progress}%`, sub: `${stats.done}/${stats.total} done` },
          { label: 'In progress', value: stats.inProgress, sub: `${stats.todo} in queue` },
          { label: 'Overdue', value: stats.overdueTasks.length, sub: 'tasks late', warn: stats.overdueTasks.length > 0 },
          { label: 'Blocked', value: stats.blockedTasks.length, sub: 'need attention', warn: stats.blockedTasks.length > 0 },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-[#DFE1E6] rounded-[3px] p-3">
            <p className="text-xs text-[#626F86]">{item.label}</p>
            <p className={`text-xl font-semibold mt-0.5 ${item.warn ? 'text-[#DE350B]' : 'text-[#172B4D]'}`}>{item.value}</p>
            <p className="text-xs text-[#8993A4]">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Work status" className="lg:col-span-2">
          <div className="h-2 w-full bg-[#DFE1E6] rounded-[3px] overflow-hidden flex mb-3">
            <div style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }} className="bg-[#00875A]" />
            <div style={{ width: `${stats.total ? (stats.inProgress / stats.total) * 100 : 0}%` }} className="bg-[#0052CC]" />
            <div style={{ width: `${stats.total ? (stats.todo / stats.total) * 100 : 0}%` }} className="bg-[#C1C7D0]" />
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-[#626F86]">
            <span>Done ({stats.done})</span>
            <span>In progress ({stats.inProgress})</span>
            <span>To do ({stats.todo})</span>
          </div>
        </Panel>

        <Panel title="Team workload">
          {Object.keys(stats.workloadMap).length === 0 ? (
            <p className="text-xs text-[#626F86]">No assignments yet.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats.workloadMap).map(([name, data]) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#172B4D]">{name}</span>
                    <span className="text-[#626F86]">{data.done}/{data.total}</span>
                  </div>
                  <div className="h-1.5 bg-[#DFE1E6] rounded-[3px] overflow-hidden flex">
                    <div style={{ width: `${(data.done / data.total) * 100}%` }} className="bg-[#00875A]" />
                    <div style={{ width: `${(data.inProgress / data.total) * 100}%` }} className="bg-[#0052CC]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="Blocked tasks" description={`${stats.blockedTasks.length} issues`}>
          {stats.blockedTasks.length === 0 ? (
            <p className="text-xs text-[#626F86]">No blockers.</p>
          ) : (
            <ul className="space-y-2">
              {stats.blockedTasks.map(t => (
                <li key={t._id || t.id} className="text-sm text-[#172B4D] border-b border-[#DFE1E6] pb-2 last:border-0">
                  <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-[#DE350B]" />
                  {t.title}
                  <p className="text-xs text-[#626F86] mt-0.5">{t.blockerReason || 'No reason specified'}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Overdue tasks" description={`${stats.overdueTasks.length} issues`}>
          {stats.overdueTasks.length === 0 ? (
            <p className="text-xs text-[#626F86]">On schedule.</p>
          ) : (
            <ul className="space-y-2">
              {stats.overdueTasks.map(t => (
                <li key={t._id || t.id} className="flex justify-between text-sm text-[#172B4D] border-b border-[#DFE1E6] pb-2 last:border-0">
                  <span className="truncate pr-2">{t.title}</span>
                  <span className="text-xs text-[#974F0C] shrink-0">
                    <Clock className="w-3 h-3 inline" /> {new Date(t.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
