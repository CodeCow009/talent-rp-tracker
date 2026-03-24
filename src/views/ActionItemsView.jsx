import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import { leaders, actionItems, getLeader, GROUPS } from '../data';

const STATUS_ORDER = { overdue: 0, in_progress: 1, open: 2, completed: 3 };

export default function ActionItemsView() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');

  const enriched = actionItems.map(a => {
    const leader = getLeader(a.leaderId);
    return { ...a, leaderName: leader?.name, leaderGroup: leader?.group };
  });

  const filtered = enriched
    .filter(a => statusFilter === 'All' || a.status === statusFilter)
    .filter(a => groupFilter === 'All' || a.leaderGroup === groupFilter)
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));

  const counts = {
    overdue: actionItems.filter(a => a.status === 'overdue').length,
    in_progress: actionItems.filter(a => a.status === 'in_progress').length,
    open: actionItems.filter(a => a.status === 'open').length,
    completed: actionItems.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Action Items</h1>
          <p className="text-sm text-gray-500 mt-0.5">{actionItems.length} total across all leaders</p>
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
            <option value="All">All Status</option>
            <option value="overdue">Overdue</option>
            <option value="in_progress">In Progress</option>
            <option value="open">Open</option>
            <option value="completed">Completed</option>
          </select>
          <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
            <option value="All">All Groups</option>
            {GROUPS.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {Object.entries(counts).map(([status, count]) => (
          <button key={status} onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
            className={`bg-white rounded-xl border p-4 text-left transition-all ${statusFilter === status ? 'ring-2 ring-accent border-accent' : 'border-gray-200'}`}>
            <StatusChip status={status} />
            <div className="text-2xl font-bold text-gray-900 mt-2">{count}</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
        {filtered.map(a => (
          <div key={a.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50">
            <input type="checkbox" checked={a.status === 'completed'} readOnly className="rounded shrink-0" />
            <StatusChip status={a.status} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className={`text-sm ${a.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{a.description}</div>
              <div className="text-xs text-gray-400 mt-0.5">Owner: {a.owner} &middot; {a.source}</div>
            </div>
            <Link to={`/leaders/${a.leaderId}`} className="text-xs text-accent hover:underline shrink-0">{a.leaderName}</Link>
            <div className="text-xs shrink-0 w-20 text-right">
              {a.status === 'overdue' ? <span className="text-red-500 font-semibold">{a.dueDate}</span> : <span className="text-gray-400">{a.dueDate}</span>}
            </div>
            <StatusChip status={a.priority} className="shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
