const STYLES = {
  green: 'bg-green-100 text-green-700',
  watch: 'bg-amber-100 text-amber-700',
  risk: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  'not-started': 'bg-gray-100 text-gray-500',
  'on_track': 'bg-green-100 text-green-700',
  'at_risk': 'bg-amber-100 text-amber-700',
  behind: 'bg-red-100 text-red-700',
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-600',
  cautious: 'bg-amber-100 text-amber-700',
  escalation: 'bg-red-100 text-red-700',
  overdue: 'bg-red-100 text-red-700',
  in_progress: 'bg-blue-100 text-blue-700',
  open: 'bg-gray-100 text-gray-600',
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-gray-100 text-gray-500',
};

const LABELS = {
  green: 'On Track', watch: 'Watch', risk: 'At Risk', completed: 'Completed',
  'not-started': 'Not Started', on_track: 'On Track', at_risk: 'At Risk', behind: 'Behind',
  positive: 'Positive', neutral: 'Neutral', cautious: 'Cautious', escalation: 'Escalation',
  overdue: 'Overdue', in_progress: 'In Progress', open: 'Open', high: 'High', medium: 'Medium', low: 'Low',
};

export default function StatusChip({ status, className = '' }) {
  const style = STYLES[status] || 'bg-gray-100 text-gray-500';
  const label = LABELS[status] || status;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${style} ${className}`}>
      {label}
    </span>
  );
}
