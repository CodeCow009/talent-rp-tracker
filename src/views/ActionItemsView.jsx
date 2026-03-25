import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import ProgressBar from '../components/ProgressBar';
import { leaders, actionItems, getLeader, GROUPS, TASK_TYPES, scoreActionCompleteness, inferTaskType, inferComplexity, findDuplicateActions, generateNudgeMessage, computePerformanceStats } from '../data';

const STATUS_ORDER = { overdue: 0, in_progress: 1, open: 2, completed: 3, complete: 3 };
const MONTHS = ['Mar', 'Apr', 'May'];
const TIMELINE_START = new Date('2026-03-01');
const TIMELINE_END = new Date('2026-05-31');
const TIMELINE_DAYS = (TIMELINE_END - TIMELINE_START) / 86400000;
const TODAY_PCT = ((new Date('2026-03-24') - TIMELINE_START) / 86400000) / TIMELINE_DAYS * 100;
function dueDateToPct(d) { return Math.max(0, Math.min(100, ((new Date(d) - TIMELINE_START) / 86400000) / TIMELINE_DAYS * 100)); }

function CompletenessRing({ score }) {
  const color = score >= 0.8 ? 'text-green-500' : score >= 0.5 ? 'text-amber-500' : 'text-red-500';
  const pct = Math.round(score * 100);
  const r = 10, circ = 2 * Math.PI * r, offset = circ - (score * circ);
  return (
    <div className="relative w-7 h-7 shrink-0" title={`Completeness: ${pct}%`}>
      <svg viewBox="0 0 24 24" className="w-7 h-7">
        <circle cx="12" cy="12" r={r} fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
        <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className={`${color} transition-all`} transform="rotate(-90 12 12)" />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-bold ${color}`}>{pct}</span>
    </div>
  );
}

function NudgeModal({ action, persona, onClose }) {
  const msg = generateNudgeMessage(action, persona?.name?.split('(')[0]?.trim() || 'Team', persona?.role || 'Executive');
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl border w-[500px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800">Follow-Up Nudge</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
        </div>
        <div className="p-5">
          <div className="text-[10px] text-gray-400 uppercase font-semibold mb-2">To: {action.owner}</div>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100 leading-relaxed font-sans">{msg}</pre>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCopy} className="text-xs bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-accent/90">
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button onClick={onClose} className="text-xs text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActionItemsView({ persona }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [completedLocal, setCompletedLocal] = useState(new Set());
  const [groupBySource, setGroupBySource] = useState(false);
  const [groupByType, setGroupByType] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [nudgeAction, setNudgeAction] = useState(null);
  const [showPerformance, setShowPerformance] = useState(false);

  const isLeaderOrDeputy = persona?.role === 'Leader' || persona?.role === 'Deputy';
  const baseItems = isLeaderOrDeputy ? actionItems.filter(a => a.leaderId === persona.leaderId) : actionItems;

  const enriched = baseItems.map(a => {
    const leader = getLeader(a.leaderId);
    const score = scoreActionCompleteness(a);
    return {
      ...a, leaderName: leader?.name, leaderGroup: leader?.group,
      status: completedLocal.has(a.id) ? 'completed' : a.status,
      completeness: score, taskType: inferTaskType(a), complexity: inferComplexity(a),
    };
  });

  const duplicates = showDuplicates ? findDuplicateActions(enriched) : [];
  const dupIds = new Set(duplicates.flatMap(d => [d.itemA, d.itemB]));

  const filtered = enriched
    .filter(a => statusFilter === 'All' || a.status === statusFilter)
    .filter(a => groupFilter === 'All' || a.leaderGroup === groupFilter)
    .filter(a => priorityFilter === 'All' || a.priority === priorityFilter)
    .filter(a => typeFilter === 'All' || a.taskType === typeFilter)
    .filter(a => !search || a.description.toLowerCase().includes(search.toLowerCase()) || a.owner?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));

  const counts = { overdue: enriched.filter(a => a.status === 'overdue').length, in_progress: enriched.filter(a => a.status === 'in_progress').length, open: enriched.filter(a => a.status === 'open').length, completed: enriched.filter(a => a.status === 'completed' || a.status === 'complete').length };
  const incompleteCount = enriched.filter(a => a.completeness.score < 0.5 && a.status !== 'completed' && a.status !== 'complete').length;

  const handleToggleSelect = (id) => { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const handleBulkComplete = () => { setCompletedLocal(prev => { const n = new Set(prev); selected.forEach(id => n.add(id)); return n; }); setSelected(new Set()); };

  const timelineItems = enriched.filter(a => a.status !== 'completed' && a.status !== 'complete' && a.dueDate).slice(0, 20);

  // Performance stats for leader view
  const perfStats = isLeaderOrDeputy ? computePerformanceStats(persona.leaderId) : null;

  const renderItem = (a) => {
    const isDup = dupIds.has(a.id);
    return (
      <div key={a.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 ${isDup ? 'bg-amber-50/30' : ''}`}>
        <input type="checkbox" checked={selected.has(a.id) || a.status === 'completed' || a.status === 'complete'} onChange={() => a.status !== 'completed' && a.status !== 'complete' && handleToggleSelect(a.id)} className="rounded shrink-0" />
        <CompletenessRing score={a.completeness.score} />
        <StatusChip status={a.status} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <div className={`text-sm ${a.status === 'completed' || a.status === 'complete' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{a.description}</div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400">Owner: {a.owner}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: TASK_TYPES.find(t => t.id === a.taskType)?.color + '15', color: TASK_TYPES.find(t => t.id === a.taskType)?.color }}>
              {TASK_TYPES.find(t => t.id === a.taskType)?.label}
            </span>
            <span className="text-[9px] text-gray-400 bg-gray-50 px-1 py-0.5 rounded">{a.complexity}</span>
            {isDup && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Possible Duplicate</span>}
            {a.completeness.suggestions.length > 0 && a.status !== 'completed' && a.status !== 'complete' && (
              <span className="text-[9px] text-red-400" title={a.completeness.suggestions.join(', ')}>
                {a.completeness.suggestions.length} suggestion{a.completeness.suggestions.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        {!isLeaderOrDeputy && <Link to={`/leaders/${a.leaderId}`} className="text-xs text-accent hover:underline shrink-0">{a.leaderName}</Link>}
        <div className="text-xs shrink-0 w-20 text-right">
          {a.status === 'overdue' ? <span className="text-red-500 font-semibold">{a.dueDate}</span> : <span className="text-gray-400">{a.dueDate}</span>}
        </div>
        {a.status === 'overdue' && (
          <button onClick={() => setNudgeAction(a)} className="text-[10px] text-accent hover:underline shrink-0 font-medium" title="Send follow-up nudge">
            Nudge
          </button>
        )}
        <StatusChip status={a.priority} className="shrink-0" />
      </div>
    );
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {nudgeAction && <NudgeModal action={nudgeAction} persona={persona} onClose={() => setNudgeAction(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{isLeaderOrDeputy ? 'My Action Items' : 'Action Items'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {baseItems.length} total &middot; {incompleteCount} incomplete
            {perfStats && perfStats.streak > 0 && <span className="text-accent font-medium ml-2">🔥 {perfStats.streak} on-time streak</span>}
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-accent" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
            <option value="All">All Status</option><option value="overdue">Overdue</option><option value="in_progress">In Progress</option><option value="open">Open</option><option value="completed">Completed</option>
          </select>
          {!isLeaderOrDeputy && <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
            <option value="All">All Groups</option>{GROUPS.map(g => <option key={g}>{g}</option>)}
          </select>}
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
            <option value="All">All Priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
            <option value="All">All Types</option>
            {TASK_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Executive Intelligence Summary */}
      {persona?.role === 'Executive' && (() => {
        const overdueByGroup = {};
        GROUPS.forEach(g => { overdueByGroup[g] = enriched.filter(a => a.status === 'overdue' && a.leaderGroup === g).length; });
        const worstGroup = Object.entries(overdueByGroup).sort((a, b) => b[1] - a[1])[0];
        const highPriorityOverdue = enriched.filter(a => a.status === 'overdue' && a.priority === 'high');
        const blockedLeaders = [...new Set(enriched.filter(a => a.status === 'overdue').map(a => a.leaderName))];
        return (
          <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-100 p-5 mb-6">
            <h3 className="text-sm font-semibold text-purple-800 mb-3">Executive Action Intelligence</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] font-semibold text-purple-400 uppercase mb-1">Escalation Summary</div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  <strong>{highPriorityOverdue.length}</strong> high-priority items are overdue.
                  {worstGroup && worstGroup[1] > 0 && <> <strong>{worstGroup[0]}</strong> has the most overdue items ({worstGroup[1]}).</>}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-purple-400 uppercase mb-1">Leaders Needing Attention</div>
                <div className="flex flex-wrap gap-1">
                  {blockedLeaders.slice(0, 6).map(name => (
                    <span key={name} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">{name?.split(' ').pop()}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-purple-400 uppercase mb-1">Recommended Focus</div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  {highPriorityOverdue.length > 3
                    ? 'Multiple critical items overdue — consider a leadership sync to unblock.'
                    : highPriorityOverdue.length > 0
                    ? 'A few items need executive nudges. Use the Nudge button on overdue items.'
                    : 'Action items are mostly on track. Monitor at-risk items.'}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Status + incomplete cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {Object.entries(counts).map(([status, count]) => (
          <button key={status} onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
            className={`bg-white rounded-xl border p-4 text-left transition-all ${statusFilter === status ? 'ring-2 ring-accent border-accent' : 'border-gray-200'}`}>
            <StatusChip status={status} />
            <div className="text-2xl font-bold text-gray-900 mt-2">{count}</div>
          </button>
        ))}
        <div className="bg-white rounded-xl border border-amber-200 p-4 text-left">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">Incomplete</span>
          <div className="text-2xl font-bold text-amber-600 mt-2">{incompleteCount}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">missing owner or deadline</div>
        </div>
      </div>

      {/* Gantt Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>
        <div className="relative">
          <div className="flex mb-1">{MONTHS.map(m => <div key={m} className="flex-1 text-center text-[10px] font-semibold text-gray-400 border-l border-gray-100 first:border-l-0">{m} 2026</div>)}</div>
          <div className="relative border border-gray-100 rounded-lg overflow-hidden" style={{ minHeight: Math.max(60, timelineItems.length * 20 + 10) }}>
            {MONTHS.map((_, i) => i > 0 && <div key={i} className="absolute top-0 bottom-0 border-l border-gray-100" style={{ left: `${(i / 3) * 100}%` }} />)}
            <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10" style={{ left: `${TODAY_PCT}%` }} />
            {timelineItems.map((item, idx) => {
              const pct = dueDateToPct(item.dueDate);
              const typeColor = TASK_TYPES.find(t => t.id === item.taskType)?.color || '#6B7280';
              const isOverdue = item.status === 'overdue';
              return (
                <div key={item.id} className="absolute flex items-center" style={{ top: 2 + idx * 20, left: `${Math.max(0, pct - 12)}%`, width: `${Math.min(12, pct)}%` }}>
                  <div className="h-3 rounded-sm flex-1 opacity-50" style={{ backgroundColor: isOverdue ? '#DC2626' : typeColor }} />
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 -ml-1" style={{ backgroundColor: isOverdue ? '#DC2626' : typeColor }} title={`${item.description} — ${item.dueDate}`} />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {TASK_TYPES.slice(0, 4).map(t => <div key={t.id} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} /><span className="text-[9px] text-gray-400">{t.label}</span></div>)}
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[9px] text-gray-400">Overdue</span></div>
          </div>
        </div>
      </div>

      {/* Performance panel for leaders */}
      {isLeaderOrDeputy && perfStats && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <button onClick={() => setShowPerformance(!showPerformance)} className="flex items-center justify-between w-full text-left">
            <h3 className="text-sm font-semibold text-gray-700">My Performance Intelligence</h3>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${showPerformance ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showPerformance && (
            <div className="mt-4 grid grid-cols-[1fr_1fr_200px] gap-6">
              {/* By type */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-3">Completion by Task Type</div>
                <div className="space-y-2">
                  {TASK_TYPES.map(t => {
                    const data = perfStats.byType[t.id];
                    if (!data || data.total === 0) return null;
                    return (
                      <div key={t.id} className="flex items-center gap-2">
                        <div className="w-20 text-[10px] font-medium" style={{ color: t.color }}>{t.label}</div>
                        <div className="flex-1"><ProgressBar value={data.rate} size="sm" showLabel={false} /></div>
                        <div className="text-[10px] text-gray-500 w-16 text-right">{data.completed}/{data.total} ({data.rate}%)</div>
                        {data.avgDays !== null && <div className="text-[10px] text-gray-400 w-12 text-right">{data.avgDays}d avg</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Strength insight */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-3">Insights</div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="bg-accent/5 rounded-lg p-3">
                    <div className="font-semibold text-accent text-[10px] uppercase">Strongest Area</div>
                    <div className="mt-1">{perfStats.strongestType ? TASK_TYPES.find(t => t.id === perfStats.strongestType)?.label : 'Not enough data'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-semibold text-gray-500 text-[10px] uppercase">Completion Rate</div>
                    <div className="text-lg font-bold text-gray-800 mt-1">{perfStats.completionRate}%</div>
                    <div className="text-[10px] text-gray-400">{perfStats.completed} of {perfStats.total} items</div>
                  </div>
                </div>
              </div>
              {/* Streak + summary */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-3">Streak</div>
                <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-accent">{perfStats.streak}</div>
                  <div className="text-[10px] text-gray-500 mt-1">consecutive on-time completions</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls bar */}
      {selected.size > 0 && (
        <div className="bg-accent/5 border border-accent/10 rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-700">{selected.size} selected</span>
          <div className="flex gap-2">
            <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500">Clear</button>
            <button onClick={handleBulkComplete} className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg font-medium">Mark Complete</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowDuplicates(!showDuplicates)} className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${showDuplicates ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              {showDuplicates ? `${duplicates.length} Duplicate${duplicates.length !== 1 ? 's' : ''} Found` : 'Check for Duplicates'}
            </span>
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setGroupByType(!groupByType); setGroupBySource(false); }} className={`text-xs font-medium ${groupByType ? 'text-accent' : 'text-gray-500 hover:text-gray-700'}`}>Group by type</button>
          <button onClick={() => { setGroupBySource(!groupBySource); setGroupByType(false); }} className={`text-xs font-medium ${groupBySource ? 'text-accent' : 'text-gray-500 hover:text-gray-700'}`}>Group by source</button>
        </div>
      </div>

      {/* List */}
      {groupByType ? (
        <div className="space-y-4">
          {TASK_TYPES.map(t => {
            const items = filtered.filter(a => a.taskType === t.id);
            if (items.length === 0) return null;
            return (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-xs font-semibold text-gray-600">{t.label}</span>
                  <span className="text-[10px] text-gray-400">({items.length})</span>
                </div>
                <div className="divide-y divide-gray-50">{items.map(renderItem)}</div>
              </div>
            );
          })}
        </div>
      ) : groupBySource ? (
        <div className="space-y-4">
          {[...new Set(filtered.map(a => a.source || a.sourceMeeting || 'Manual'))].map(source => {
            const items = filtered.filter(a => (a.source || a.sourceMeeting || 'Manual') === source);
            return (
              <div key={source} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-600">{source}</span>
                  <span className="text-[10px] text-gray-400 ml-2">({items.length})</span>
                </div>
                <div className="divide-y divide-gray-50">{items.map(renderItem)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {filtered.map(renderItem)}
        </div>
      )}
    </div>
  );
}
