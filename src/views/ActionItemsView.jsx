import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import ProgressBar from '../components/ProgressBar';
import { leaders, actionItems, getLeader, GROUPS } from '../data';

const STATUS_ORDER = { overdue: 0, in_progress: 1, open: 2, completed: 3 };
const MONTHS = ['Mar', 'Apr', 'May'];
const TIMELINE_START = new Date('2026-03-01');
const TIMELINE_END = new Date('2026-05-31');
const TIMELINE_DAYS = (TIMELINE_END - TIMELINE_START) / 86400000;
const TODAY_PCT = ((new Date('2026-03-24') - TIMELINE_START) / 86400000) / TIMELINE_DAYS * 100;

function dueDateToPct(d) {
  const ms = new Date(d) - TIMELINE_START;
  return Math.max(0, Math.min(100, (ms / 86400000) / TIMELINE_DAYS * 100));
}

export default function ActionItemsView() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [completedLocal, setCompletedLocal] = useState(new Set());
  const [groupBySource, setGroupBySource] = useState(false);

  const enriched = actionItems.map(a => {
    const leader = getLeader(a.leaderId);
    return {
      ...a,
      leaderName: leader?.name,
      leaderGroup: leader?.group,
      status: completedLocal.has(a.id) ? 'completed' : a.status,
    };
  });

  const filtered = enriched
    .filter(a => statusFilter === 'All' || a.status === statusFilter)
    .filter(a => groupFilter === 'All' || a.leaderGroup === groupFilter)
    .filter(a => priorityFilter === 'All' || a.priority === priorityFilter)
    .filter(a => !search || a.description.toLowerCase().includes(search.toLowerCase()) || a.owner?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));

  const counts = {
    overdue: enriched.filter(a => a.status === 'overdue').length,
    in_progress: enriched.filter(a => a.status === 'in_progress').length,
    open: enriched.filter(a => a.status === 'open').length,
    completed: enriched.filter(a => a.status === 'completed').length,
  };

  const handleToggleSelect = (id) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const handleBulkComplete = () => {
    setCompletedLocal(prev => { const next = new Set(prev); selected.forEach(id => next.add(id)); return next; });
    setSelected(new Set());
  };

  const selectAll = () => {
    const all = new Set(filtered.filter(a => a.status !== 'completed').map(a => a.id));
    setSelected(all);
  };

  // Timeline data (non-completed only)
  const timelineItems = enriched.filter(a => a.status !== 'completed' && a.dueDate).slice(0, 20);

  // Grouped view
  const sources = [...new Set(filtered.map(a => a.source))];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Action Items</h1>
          <p className="text-sm text-gray-500 mt-0.5">{actionItems.length} total across all leaders</p>
        </div>
        <div className="flex gap-2 items-center">
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-accent" />
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
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
            <option value="All">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
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

      {/* Gantt Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Action Items Timeline</h3>
        <div className="relative">
          {/* Month headers */}
          <div className="flex mb-1">
            {MONTHS.map((m, i) => (
              <div key={m} className="flex-1 text-center text-[10px] font-semibold text-gray-400 border-l border-gray-100 first:border-l-0">{m} 2026</div>
            ))}
          </div>
          {/* Grid */}
          <div className="relative border border-gray-100 rounded-lg overflow-hidden" style={{ minHeight: Math.max(80, timelineItems.length * 22 + 20) }}>
            {/* Month grid lines */}
            {MONTHS.map((_, i) => i > 0 && <div key={i} className="absolute top-0 bottom-0 border-l border-gray-100" style={{ left: `${(i / 3) * 100}%` }} />)}
            {/* Today */}
            <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10" style={{ left: `${TODAY_PCT}%` }} />
            {/* Items */}
            {timelineItems.map((item, idx) => {
              const pct = dueDateToPct(item.dueDate);
              const color = item.status === 'overdue' ? 'bg-red-500' : item.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400';
              return (
                <div key={item.id} className="absolute flex items-center" style={{ top: 4 + idx * 22, left: `${Math.max(0, pct - 15)}%`, width: `${Math.min(15, pct)}%` }}>
                  <div className={`h-3 ${color} rounded-sm flex-1 opacity-60`} />
                  <div className={`w-2.5 h-2.5 ${color} rounded-full shrink-0 -ml-1`} title={`${item.description} — ${item.dueDate}`} />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-red-500 rounded-full" /><span className="text-[10px] text-gray-400">Overdue</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /><span className="text-[10px] text-gray-400">In Progress</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-gray-400 rounded-full" /><span className="text-[10px] text-gray-400">Open</span></div>
            <div className="w-px h-3 bg-red-400 ml-2" /><span className="text-[10px] text-gray-400">Today</span>
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="bg-accent/5 border border-accent/10 rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-700">{selected.size} item{selected.size > 1 ? 's' : ''} selected</span>
          <div className="flex gap-2">
            <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
            <button onClick={handleBulkComplete} className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg font-medium hover:bg-accent/90">Mark Complete</button>
          </div>
        </div>
      )}

      {/* Group by source toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {selected.size === 0 && (
            <button onClick={selectAll} className="text-[10px] text-accent hover:underline font-medium">Select all visible</button>
          )}
        </div>
        <button onClick={() => setGroupBySource(!groupBySource)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
          {groupBySource ? 'Flat view' : 'Group by source'}
        </button>
      </div>

      {/* Action Items List */}
      {groupBySource ? (
        <div className="space-y-4">
          {sources.map(source => {
            const items = filtered.filter(a => a.source === source);
            return (
              <div key={source} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-600">{source}</span>
                  <span className="text-[10px] text-gray-400 ml-2">({items.length})</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {items.map(a => (
                    <div key={a.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50">
                      <input type="checkbox" checked={selected.has(a.id) || a.status === 'completed'} onChange={() => a.status !== 'completed' && handleToggleSelect(a.id)} className="rounded shrink-0" />
                      <StatusChip status={a.status} className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm ${a.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{a.description}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Owner: {a.owner}</div>
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
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {filtered.map(a => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50">
              <input type="checkbox" checked={selected.has(a.id) || a.status === 'completed'} onChange={() => a.status !== 'completed' && handleToggleSelect(a.id)} className="rounded shrink-0" />
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
      )}
    </div>
  );
}
