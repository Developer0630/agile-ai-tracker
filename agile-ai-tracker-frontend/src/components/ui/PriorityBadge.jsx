import Badge from './Badge';

const PRIORITY_MAP = {
  LOW: { label: 'Low', tone: 'neutral' },
  MEDIUM: { label: 'Medium', tone: 'blue' },
  HIGH: { label: 'High', tone: 'yellow' },
  URGENT: { label: 'Urgent', tone: 'red' },
};

export default function PriorityBadge({ priority }) {
  const key = priority?.toUpperCase?.() || 'MEDIUM';
  const config = PRIORITY_MAP[key] || { label: priority || 'Medium', tone: 'neutral' };
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
