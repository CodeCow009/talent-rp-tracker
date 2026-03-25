import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import ProgressBar from '../components/ProgressBar';
import { leaders, masterObjectives, keyResults, narratives, intersections, getKeyResultsForObjective, getLeader } from '../data';

const TOPICS = ['All', 'Client Developments', 'Strategic Progress', 'Risks & Blockers', 'Cross-Team Needs', 'Team & Capability'];
const SENTIMENTS = ['all', 'escalation', 'cautious', 'positive', 'neutral'];
const SENTIMENT_LABELS = { all: 'All', escalation: 'Escalation', cautious: 'Cautious', positive: 'Positive', neutral: 'Neutral' };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const GANTT_START = new Date('2026-01-01');
const GANTT_END = new Date('2026-06-30');
const GANTT_DAYS = (GANTT_END - GANTT_START) / 86400000;
const TODAY = new Date('2026-03-24');
const TODAY_PCT = ((TODAY - GANTT_START) / 86400000) / GANTT_DAYS * 100;

function dateToPct(d) {
  const ms = new Date(d) - GANTT_START;
  return Math.max(0, Math.min(100, (ms / 86400000) / GANTT_DAYS * 100));
}

const STATUS_COLORS = {
  on_track: { bar: 'bg-green-400', fill: 'bg-green-500' },
  at_risk: { bar: 'bg-amber-300', fill: 'bg-amber-500' },
  behind: { bar: 'bg-red-300', fill: 'bg-red-500' },
  completed: { bar: 'bg-blue-300', fill: 'bg-blue-500' },
  not_started: { bar: 'bg-gray-200', fill: 'bg-gray-400' },
};

export default function StrategyDashboard() {
  const [topicFilter, setTopicFilter] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [expandedObj, setExpandedObj] = useState(null);
  const [ganttGroupBy, setGanttGroupBy] = useState('objective');
  const [hoveredKR, setHoveredKR] = useState(null);

  const filteredNarratives = narratives
    .filter(n => topicFilter === 'All' || n.topic === topicFilter)
    .filter(n => sentimentFilter === 'all' || n.sentiment === sentimentFilter)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const uncoordinated = intersections.filter(i => i.status === 'identified').length;

  // Gantt rows grouped
  const ganttRows = [];
  if (ganttGroupBy === 'objective') {
    masterObjectives.forEach(obj => {
      const krs = getKeyResultsForObjective(obj.id);
      if (krs.length) {
        ganttRows.push({ type: 'header', label: obj.title, id: obj.id });
        krs.forEach(kr => ganttRows.push({ type: 'kr', kr, leader: getLeader(kr.leaderId) }));
      }
    });
  } else {
    const byLeader = {};
    keyResults.forEach(kr => {
      if (!byLeader[kr.leaderId]) byLeader[kr.leaderId] = [];
      byLeader[kr.leaderId].push(kr);
    });
    Object.entries(byLeader).forEach(([lid, krs]) => {
      const leader = getLeader(lid);
      ganttRows.push({ type: 'header', label: leader?.name || lid, id: lid });
      krs.forEach(kr => ganttRows.push({ type: 'kr', kr, leader }));
    });
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Strategy & Progress</h1>
        <p className="text-sm text-gray-500 mt-0.5">Qualitative tracking & cross-strategy visibility &middot; Q3 FY26</p>
      </div>

      {/* Master Objectives */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Master Strategic Objectives</h2>
        <div className="space-y-3">
          {masterObjectives.map(obj => {
            const krs = getKeyResultsForObjective(obj.id);
            const onTrack = krs.filter(k => k.status === 'on_track' || k.status === 'completed').length;
            const avgProgress = krs.length ? Math.round(krs.reduce((s, k) => s + (k.progress || 0), 0) / krs.length) : obj.progress || 0;
            const expanded = expandedObj === obj.id;
            return (
              <div key={obj.id}>
                <button onClick={() => setExpandedObj(expanded ? null : obj.id)} className="w-full text-left hover:bg-gray-50 rounded-lg p-3 -m-1 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-800 pr-4">{obj.title}</div>
                    <div className="text-xs text-gray-500 shrink-0">{krs.length > 0 ? `${onTrack}/${krs.length} KRs on track` : obj.targetQuarter}</div>
                  </div>
                  <ProgressBar value={avgProgress} size="md" />
                </button>
                {expanded && krs.length > 0 && (
                  <div className="ml-6 mt-2 space-y-2 border-l-2 border-accent/20 pl-4 pb-2">
                    {krs.map(kr => {
                      const leader = getLeader(kr.leaderId);
                      return (
                        <div key={kr.id} className="flex items-center gap-3 text-sm">
                          <StatusChip status={kr.status} />
                          <span className="text-gray-700 flex-1">{kr.description}</span>
                          <Link to={`/leaders/${kr.leaderId}`} className="text-xs text-accent hover:underline shrink-0">{leader?.name}</Link>
                          <span className="text-xs text-gray-400 w-10 text-right">{kr.progress}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-6">
        {/* Narrative Feed */}
        <div>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700">Latest Narrative Updates</h2>
              <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent">
                {TOPICS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {SENTIMENTS.map(s => (
                <button key={s} onClick={() => setSentimentFilter(sentimentFilter === s ? 'all' : s)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full transition-all ${
                    sentimentFilter === s && s !== 'all'
                      ? s === 'escalation' ? 'bg-red-100 text-red-700 ring-1 ring-offset-1 ring-red-200'
                      : s === 'cautious' ? 'bg-amber-100 text-amber-700 ring-1 ring-offset-1 ring-amber-200'
                      : s === 'positive' ? 'bg-green-100 text-green-700 ring-1 ring-offset-1 ring-green-200'
                      : 'bg-gray-200 text-gray-600 ring-1 ring-offset-1 ring-gray-300'
                    : sentimentFilter === s ? 'bg-accent text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}>
                  {SENTIMENT_LABELS[s]}
                  {s !== 'all' && <span className="ml-1 opacity-70">({narratives.filter(n => n.sentiment === s).length})</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredNarratives.map(n => {
              const leader = getLeader(n.leaderId);
              return (
                <Link key={n.id} to={`/leaders/${n.leaderId}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold">{leader?.avatar}</div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">{n.authorType === 'Deputy' ? `${n.author} (Deputy)` : n.author}</span>
                        <span className="text-xs text-gray-400 ml-2">{leader?.group}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusChip status={n.sentiment} />
                      <span className="text-xs text-gray-400">{n.date}</span>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-accent/70 mb-1">{n.topic}</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{n.content}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {n.tags.map(t => <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>)}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Gantt Timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Key Result Timeline</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                <button onClick={() => setGanttGroupBy('objective')} className={`text-[10px] font-medium px-2 py-1 rounded-md ${ganttGroupBy === 'objective' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>By Objective</button>
                <button onClick={() => setGanttGroupBy('leader')} className={`text-[10px] font-medium px-2 py-1 rounded-md ${ganttGroupBy === 'leader' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>By Leader</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Month headers */}
            <div className="flex border-b border-gray-100">
              <div className="w-40 shrink-0 px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase bg-gray-50">Key Result</div>
              <div className="flex-1 flex relative">
                {MONTHS.map((m, i) => (
                  <div key={m} className="flex-1 text-center text-[10px] font-semibold text-gray-400 py-2 border-l border-gray-50">{m}</div>
                ))}
                {/* Today line */}
                <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10" style={{ left: `${TODAY_PCT}%` }}>
                  <div className="absolute -top-0 -left-2 text-[8px] text-red-400 font-bold bg-white px-0.5">Today</div>
                </div>
              </div>
            </div>

            {/* Gantt rows */}
            <div className="max-h-[540px] overflow-y-auto">
              {ganttRows.map((row, idx) => {
                if (row.type === 'header') {
                  return (
                    <div key={row.id} className="flex items-center px-3 py-1.5 bg-gray-50/80 border-b border-gray-50">
                      <div className="text-[10px] font-semibold text-gray-600 line-clamp-1">{row.label}</div>
                    </div>
                  );
                }
                const { kr, leader } = row;
                const startPct = dateToPct(kr.startDate || '2026-01-01');
                const endPct = dateToPct(kr.targetDate || '2026-06-30');
                const width = Math.max(3, endPct - startPct);
                const colors = STATUS_COLORS[kr.status] || STATUS_COLORS.not_started;
                const isHovered = hoveredKR === kr.id;

                return (
                  <div key={kr.id} className="flex items-center border-b border-gray-50 hover:bg-gray-50/50 relative"
                    onMouseEnter={() => setHoveredKR(kr.id)} onMouseLeave={() => setHoveredKR(null)}>
                    <div className="w-40 shrink-0 px-3 py-2">
                      <div className="text-[10px] text-gray-600 line-clamp-1">{leader?.name?.split(' ').pop()}</div>
                    </div>
                    <div className="flex-1 relative h-8 flex items-center">
                      {/* Month grid lines */}
                      {MONTHS.map((_, i) => <div key={i} className="absolute top-0 bottom-0 border-l border-gray-50" style={{ left: `${(i / 6) * 100}%` }} />)}
                      {/* Bar background (full span) */}
                      <div className={`absolute h-4 ${colors.bar} rounded-sm opacity-40`} style={{ left: `${startPct}%`, width: `${width}%` }} />
                      {/* Bar fill (progress) */}
                      <div className={`absolute h-4 ${colors.fill} rounded-sm opacity-80`} style={{ left: `${startPct}%`, width: `${width * (kr.progress || 0) / 100}%` }} />
                      {/* Progress label */}
                      <div className="absolute text-[8px] font-bold text-white pointer-events-none" style={{ left: `${startPct + 1}%`, top: '50%', transform: 'translateY(-50%)' }}>
                        {kr.progress}%
                      </div>
                    </div>
                    <div className="w-16 shrink-0 px-2">
                      <StatusChip status={kr.status} />
                    </div>

                    {/* Hover tooltip */}
                    {isHovered && (
                      <div className="absolute z-30 left-44 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs w-64">
                        <div className="font-semibold text-gray-800 mb-1">{kr.description}</div>
                        <div className="text-gray-500 mb-1">{leader?.name} &middot; {leader?.group}</div>
                        <div className="flex items-center gap-3">
                          <span>Progress: <strong>{kr.progress}%</strong></span>
                          <StatusChip status={kr.status} />
                        </div>
                        <div className="text-gray-400 mt-1">{kr.startDate} &rarr; {kr.targetDate}</div>
                        <Link to={`/leaders/${kr.leaderId}`} className="text-accent text-[10px] font-medium mt-1 inline-block">View leader page &rarr;</Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-3 py-2 border-t border-gray-100 bg-gray-50/50">
              <span className="text-[10px] text-gray-400 font-semibold">STATUS:</span>
              <div className="flex items-center gap-1"><div className="w-3 h-2 bg-green-500 rounded-sm" /><span className="text-[10px] text-gray-500">On Track</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-2 bg-amber-500 rounded-sm" /><span className="text-[10px] text-gray-500">At Risk</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-2 bg-red-500 rounded-sm" /><span className="text-[10px] text-gray-500">Behind</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-2 bg-blue-500 rounded-sm" /><span className="text-[10px] text-gray-500">Completed</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-2 bg-gray-300 rounded-sm" /><span className="text-[10px] text-gray-500">Not Started</span></div>
            </div>
          </div>

          {/* Intersection Callout */}
          <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 mt-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-800">{uncoordinated} strategy overlaps need coordination</div>
              <p className="text-xs text-gray-500 mt-0.5">Leaders working on similar themes may benefit from alignment</p>
            </div>
            <Link to="/strategy-map" className="text-sm text-accent font-medium hover:underline shrink-0">View Strategy Map &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
