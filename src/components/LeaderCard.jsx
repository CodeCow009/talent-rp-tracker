import { Link } from 'react-router-dom';
import StatusChip from './StatusChip';
import ProgressBar from './ProgressBar';
import { daysSinceUpdate } from '../data';

export default function LeaderCard({ leader, financial }) {
  const daysSince = leader.lastUpdated ? daysSinceUpdate(leader.lastUpdated) : null;
  const stale = daysSince > 14;

  return (
    <Link
      to={`/leaders/${leader.id}`}
      className={`block bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
        stale ? 'border-red-200' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold shrink-0">
          {leader.avatar}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-gray-900 truncate">{leader.name}</div>
          <div className="text-xs text-gray-500 truncate">{leader.subGroup}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 px-1.5 py-0.5 rounded">
          {leader.group}
        </span>
        <StatusChip status={leader.overallHealth} />
      </div>

      {financial && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Revenue</span>
            <span className="font-medium">{financial.revenuePctToTarget}%</span>
          </div>
          <ProgressBar value={financial.revenuePctToTarget} size="sm" showLabel={false} />
        </div>
      )}

      <div className="mt-2 text-[11px] text-gray-400">
        Updated {daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : `${daysSince}d ago`}
        {stale && <span className="text-red-500 font-semibold ml-1">Stale</span>}
      </div>
    </Link>
  );
}
