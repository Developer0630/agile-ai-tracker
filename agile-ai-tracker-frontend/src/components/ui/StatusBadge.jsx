import Badge from './Badge';

const STATUS_MAP = {
  TODO: { label: 'To Do', tone: 'neutral' },
  IN_PROGRESS: { label: 'In Progress', tone: 'blue' },
  REVIEW: { label: 'Review', tone: 'purple' },
  DONE: { label: 'Done', tone: 'green' },
  PLANNED: { label: 'Planned', tone: 'neutral' },
  ACTIVE: { label: 'Active', tone: 'green' },
  COMPLETED: { label: 'Completed', tone: 'blue' },
};

export default function StatusBadge({ status }) {
  const key = status?.toUpperCase?.() || 'TODO';
  const config = STATUS_MAP[key] || { label: status || 'Unknown', tone: 'neutral' };
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
