import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import { intersections, getLeader, financials } from '../data';

const THEMES = ['All', 'GenAI', 'FSI', 'APAC', 'Workforce', 'Methodology', 'Banking', 'HRTech', 'Messaging', 'Delivery', 'Profitability'];
const STRENGTHS = ['All', 'strong', 'moderate', 'weak'];
const STATUSES = ['All', 'identified', 'coordinating', 'acknowledged'];

export default function StrategyMap() {
  const [themeFilter, setThemeFilter] = useState('All');
  const [strengthFilter, setStrengthFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = intersections
    .filter(i => themeFilter === 'All' || i.sharedThemes.some(t => t.toLowerCase().includes(themeFilter.toLowerCase())))
    .filter(i => strengthFilter === 'All' || i.strength === strengthFilter)
    .filter(i => statusFilter === 'All' || i.status === statusFilter);

  const involvedIds = [...new Set(filtered.flatMap(i => [i.leaderAId, i.leaderBId]))];
  const involved = involvedIds.map(id => getLeader(id)).filter(Boolean);
  const allThemes = [...new Set(filtered.flatMap(i => i.sharedThemes))];

  const intensity = {};
  involvedIds.forEach(lid => {
    intensity[lid] = {};
    allThemes.forEach(t => {
      intensity[lid][t] = filtered.filter(i => (i.leaderAId === lid || i.leaderBId === lid) && i.sharedThemes.includes(t)).length;
    });
  });

  // Summary stats for the value justification
  const strongCount = intersections.filter(i => i.strength === 'strong').length;
  const identifiedCount = intersections.filter(i => i.status === 'identified').length;
  const coordinatingCount = intersections.filter(i => i.status === 'coordinating').length;

  // Compute combined pipeline at risk from uncoordinated intersections
  const uncoordinatedLeaderIds = [...new Set(
    intersections.filter(i => i.status === 'identified').flatMap(i => [i.leaderAId, i.leaderBId])
  )];
  const atRiskPipeline = uncoordinatedLeaderIds.reduce((s, lid) => {
    const f = financials.find(x => x.leaderId === lid);
    return s + (f?.pipelineValue || 0);
  }, 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Strategy Intersection Map</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Cross-strategy visibility &mdash; where leaders' work overlaps, depends on each other, or risks duplication
          </p>
        </div>
      </div>

      {/* Value justification summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Connections</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{intersections.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">across {involvedIds.length} leaders</div>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-4">
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">Needs Coordination</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{identifiedCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">connections not yet coordinated</div>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-4">
          <div className="text-xs font-semibold text-green-500 uppercase tracking-wider">Actively Coordinating</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{coordinatingCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">teams aligned and working together</div>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4">
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Pipeline at Stake</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">${(atRiskPipeline / 1e6).toFixed(0)}M</div>
          <div className="text-xs text-gray-500 mt-0.5">combined pipeline of uncoordinated leaders</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={themeFilter} onChange={e => setThemeFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          {THEMES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={strengthFilter} onChange={e => setStrengthFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          <option value="All">All Strengths</option>
          <option value="strong">Strong</option>
          <option value="moderate">Moderate</option>
          <option value="weak">Weak</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          <option value="All">All Statuses</option>
          <option value="identified">Identified (Needs Action)</option>
          <option value="coordinating">Coordinating</option>
          <option value="acknowledged">Acknowledged</option>
        </select>
        {(themeFilter !== 'All' || strengthFilter !== 'All' || statusFilter !== 'All') && (
          <button onClick={() => { setThemeFilter('All'); setStrengthFilter('All'); setStatusFilter('All'); }}
            className="text-xs text-accent hover:underline font-medium">Clear filters</button>
        )}
      </div>

      <div className="grid grid-cols-[1fr_400px] gap-6">
        {/* Matrix */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-auto">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Theme Intensity Matrix</h2>
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left px-2 py-1.5 font-semibold text-gray-500 sticky left-0 bg-white z-10">Leader</th>
                {allThemes.map(t => (
                  <th key={t} className="px-1 py-1.5 font-semibold text-gray-500 text-center whitespace-nowrap">
                    <span className="inline-block" style={{ writingMode: 'vertical-rl' }}>{t}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {involved.map(l => (
                <tr key={l.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-2 py-1.5 sticky left-0 bg-white z-10">
                    <Link to={`/leaders/${l.id}`} className="text-gray-700 hover:text-accent font-medium">{l.name}</Link>
                    <div className="text-[10px] text-gray-400">{l.group}</div>
                  </td>
                  {allThemes.map(t => {
                    const val = intensity[l.id]?.[t] || 0;
                    const bg = val === 0 ? 'bg-gray-50' : val === 1 ? 'bg-accent/20' : val === 2 ? 'bg-accent/40' : 'bg-accent/60';
                    return (
                      <td key={t} className="px-1 py-1.5 text-center">
                        <div className={`w-7 h-7 rounded ${bg} mx-auto flex items-center justify-center text-[10px] font-semibold ${val ? 'text-accent' : 'text-transparent'}`}>
                          {val || '.'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Connection Detail Panel */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Connections
            <span className="text-gray-400 font-normal ml-1">({filtered.length})</span>
          </h2>
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filtered.map(c => {
              const a = getLeader(c.leaderAId);
              const b = getLeader(c.leaderBId);
              const isOpen = selected === c.id;
              const statusStyle = c.status === 'identified' ? 'border-l-red-400' : c.status === 'coordinating' ? 'border-l-green-400' : 'border-l-gray-300';

              return (
                <button key={c.id} onClick={() => setSelected(isOpen ? null : c.id)}
                  className={`w-full text-left bg-white rounded-xl border border-l-4 ${statusStyle} p-4 transition-all ${isOpen ? 'ring-2 ring-accent border-accent' : 'border-gray-200 hover:border-gray-300'}`}>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <Link to={`/leaders/${c.leaderAId}`} onClick={e => e.stopPropagation()} className="text-sm font-medium text-accent hover:underline">{c.leaderAName || a?.name}</Link>
                    <span className="text-gray-300">&harr;</span>
                    <Link to={`/leaders/${c.leaderBId}`} onClick={e => e.stopPropagation()} className="text-sm font-medium text-accent hover:underline">{c.leaderBName || b?.name}</Link>
                  </div>

                  {/* Metadata row */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className={`w-2 h-2 rounded-full ${c.strength === 'strong' ? 'bg-accent' : c.strength === 'moderate' ? 'bg-amber-400' : 'bg-gray-300'}`} />
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">{c.strength}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      c.status === 'identified' ? 'bg-red-50 text-red-600' : c.status === 'coordinating' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
                    }`}>
                      {c.status === 'identified' ? 'Needs Coordination' : c.status === 'coordinating' ? 'Coordinating' : 'Acknowledged'}
                    </span>
                    {c.sharedThemes.map(t => <span key={t} className="text-[10px] bg-accent/5 text-accent px-1.5 py-0.5 rounded">{t}</span>)}
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                      <p className="text-xs text-gray-600">{c.description}</p>

                      {/* Leader A's work */}
                      {c.leaderAWork && (
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <div className="text-[10px] font-semibold text-gray-500 mb-1">
                            {c.leaderAName} &mdash; {a?.group}
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{c.leaderAWork}</p>
                        </div>
                      )}

                      {/* Leader B's work */}
                      {c.leaderBWork && (
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <div className="text-[10px] font-semibold text-gray-500 mb-1">
                            {c.leaderBName} &mdash; {b?.group}
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{c.leaderBWork}</p>
                        </div>
                      )}

                      {/* Suggested Action */}
                      <div className="bg-accent/5 border border-accent/10 rounded-lg p-2.5">
                        <div className="text-[10px] text-accent font-semibold mb-0.5">Recommended Action</div>
                        <p className="text-xs text-gray-700 leading-relaxed">{c.suggestedAction}</p>
                      </div>

                      {/* Quick links */}
                      <div className="flex gap-2">
                        <Link to={`/leaders/${c.leaderAId}`} onClick={e => e.stopPropagation()}
                          className="text-[10px] bg-accent text-white px-2 py-1 rounded font-medium hover:bg-accent/90">
                          View {c.leaderAName?.split(' ').pop()}'s Page
                        </Link>
                        <Link to={`/leaders/${c.leaderBId}`} onClick={e => e.stopPropagation()}
                          className="text-[10px] bg-accent text-white px-2 py-1 rounded font-medium hover:bg-accent/90">
                          View {c.leaderBName?.split(' ').pop()}'s Page
                        </Link>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
