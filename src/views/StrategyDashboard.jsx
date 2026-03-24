import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import ProgressBar from '../components/ProgressBar';
import { leaders, masterObjectives, keyResults, narratives, getKeyResultsForObjective, getLeader } from '../data';

const TOPICS = ['All', 'Client Developments', 'Strategic Progress', 'Risks & Blockers', 'Cross-Team Needs', 'Team & Capability'];

export default function StrategyDashboard() {
  const [topicFilter, setTopicFilter] = useState('All');
  const [expandedObj, setExpandedObj] = useState(null);

  const filteredNarratives = (topicFilter === 'All' ? narratives : narratives.filter(n => n.topic === topicFilter))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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
                <button
                  onClick={() => setExpandedObj(expanded ? null : obj.id)}
                  className="w-full text-left hover:bg-gray-50 rounded-lg p-3 -m-1 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-800 pr-4">{obj.title}</div>
                    <div className="text-xs text-gray-500 shrink-0">
                      {krs.length > 0 ? `${onTrack}/${krs.length} KRs on track` : obj.targetQuarter}
                    </div>
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Latest Narrative Updates</h2>
            <select
              value={topicFilter}
              onChange={e => setTopicFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredNarratives.map(n => {
              const leader = getLeader(n.leaderId);
              return (
                <Link key={n.id} to={`/leaders/${n.leaderId}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold">
                        {leader?.avatar}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">
                          {n.authorType === 'Deputy' ? `${n.author} (Deputy)` : n.author}
                        </span>
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
                    {n.tags.map(t => (
                      <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Key Result Timeline</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 max-h-[600px] overflow-y-auto">
            <div className="space-y-2">
              {keyResults.map(kr => {
                const leader = getLeader(kr.leaderId);
                const start = new Date(kr.startDate || '2026-01-01');
                const end = new Date(kr.targetDate || '2026-06-30');
                const now = new Date('2026-03-24');
                const totalDays = Math.max(1, (end - start) / 86400000);
                const elapsed = Math.max(0, (now - start) / 86400000);
                const pctElapsed = Math.min(100, (elapsed / totalDays) * 100);

                const statusColor = kr.status === 'on_track' ? 'bg-green-400'
                  : kr.status === 'at_risk' ? 'bg-amber-400'
                  : kr.status === 'behind' ? 'bg-red-400'
                  : kr.status === 'completed' ? 'bg-blue-400'
                  : 'bg-gray-300';

                return (
                  <div key={kr.id} className="flex items-center gap-3 py-1.5">
                    <div className="w-24 shrink-0">
                      <div className="text-xs text-gray-700 font-medium truncate">{leader?.name?.split(' ').pop()}</div>
                    </div>
                    <div className="flex-1 relative h-5 bg-gray-50 rounded overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full ${statusColor} rounded opacity-80`}
                        style={{ width: `${kr.progress || 0}%` }}
                      />
                      <div
                        className="absolute top-0 h-full w-px bg-gray-400"
                        style={{ left: `${pctElapsed}%` }}
                        title="Today"
                      />
                    </div>
                    <div className="w-10 text-right text-xs text-gray-500">{kr.progress}%</div>
                    <StatusChip status={kr.status} className="shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
