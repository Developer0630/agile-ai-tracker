import { PageHeader, Panel } from './ui';

export default function ReportsView({ projectId }) {
  return (
    <div className="space-y-4">
      <PageHeader title="Reports" description="Project metrics and sprint performance." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Panel title="Tasks completed" noPadding={false}>
          <p className="text-2xl font-semibold text-[#172B4D]">85%</p>
          <p className="text-xs text-[#626F86] mt-1">Completion rate</p>
        </Panel>
        <Panel title="Sprint velocity">
          <p className="text-2xl font-semibold text-[#172B4D]">12 pts</p>
          <p className="text-xs text-[#626F86] mt-1">Current sprint</p>
        </Panel>
        <Panel title="Blocked tasks">
          <p className="text-2xl font-semibold text-[#DE350B]">2</p>
          <p className="text-xs text-[#626F86] mt-1">Needs resolution</p>
        </Panel>
      </div>
    </div>
  );
}
