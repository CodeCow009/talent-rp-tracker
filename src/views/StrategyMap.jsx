import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import { intersections, getLeader, financials, leaders, GROUPS } from '../data';

const GROUP_COLORS = {
  Offerings: '#2563EB', Markets: '#7C3AED', Industries: '#059669',
  Engines: '#D97706', 'Growth & Strategy': '#DC2626',
};

const THEMES = ['All', 'GenAI', 'FSI', 'APAC', 'Workforce', 'Methodology', 'Banking', 'HRTech', 'Messaging', 'Delivery', 'Profitability'];

export default function StrategyMap() {
  const [themeFilter, setThemeFilter] = useState('All');
  const [strengthFilter, setStrengthFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [viewMode, setViewMode] = useState('network');

  const filtered = intersections
    .filter(i => themeFilter === 'All' || i.sharedThemes.some(t => t.toLowerCase().includes(themeFilter.toLowerCase())))
    .filter(i => strengthFilter === 'All' || i.strength === strengthFilter)
    .filter(i => statusFilter === 'All' || i.status === statusFilter);

  const involvedIds = [...new Set(filtered.flatMap(i => [i.leaderAId, i.leaderBId]))];
  const involved = involvedIds.map(id => getLeader(id)).filter(Boolean);

  // Network layout: position nodes in a circle grouped by their group
  const nodePositions = useMemo(() => {
    const cx = 350, cy = 280, radius = 220;
    const positions = {};
    const grouped = {};
    involved.forEach(l => {
      if (!grouped[l.group]) grouped[l.group] = [];
      grouped[l.group].push(l);
    });
    const groups = Object.keys(grouped);
    let idx = 0;
    const total = involved.length;
    groups.forEach((g, gi) => {
      const members = grouped[g];
      members.forEach((l, li) => {
        const angle = (2 * Math.PI * idx / total) - Math.PI / 2;
        positions[l.id] = {
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        };
        idx++;
      });
    });
    return positions;
  }, [involved]);

  const connectionCounts = useMemo(() => {
    const counts = {};
    filtered.forEach(i => {
      counts[i.leaderAId] = (counts[i.leaderAId] || 0) + 1;
      counts[i.leaderBId] = (counts[i.leaderBId] || 0) + 1;
    });
    return counts;
  }, [filtered]);

  const strongCount = intersections.filter(i => i.strength === 'strong').length;
  const identifiedCount = intersections.filter(i => i.status === 'identified').length;
  const coordinatingCount = intersections.filter(i => i.status === 'coordinating').length;
  const uncoordinatedLeaderIds = [...new Set(intersections.filter(i => i.status === 'identified').flatMap(i => [i.leaderAId, i.leaderBId]))];
  const atRiskPipeline = uncoordinatedLeaderIds.reduce((s, lid) => {
    const f = financials.find(x => x.leaderId === lid);
    return s + (f?.pipelineValue || 0);
  }, 0);

  const isHighlighted = (id) => {
    if (!selectedNode) return true;
    if (id === selectedNode) return true;
    return filtered.some(i => (i.leaderAId === selectedNode && i.leaderBId === id) || (i.leaderBId === selectedNode && i.leaderAId === id));
  };

  const isEdgeHighlighted = (edge) => {
    if (!selectedNode) return true;
    return edge.leaderAId === selectedNode || edge.leaderBId === selectedNode;
  };

  const selectedDetail = selectedEdge ? filtered.find(i => i.id === selectedEdge) : null;
  const selectedNodeConnections = selectedNode ? filtered.filter(i => i.leaderAId === selectedNode || i.leaderBId === selectedNode) : [];

  // Matrix data
  const allThemes = [...new Set(filtered.flatMap(i => i.sharedThemes))];
  const intensity = {};
  involvedIds.forEach(lid => {
    intensity[lid] = {};
    allThemes.forEach(t => {
      intensity[lid][t] = filtered.filter(i => (i.leaderAId === lid || i.leaderBId === lid) && i.sharedThemes.includes(t)).length;
    });
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Strategy Intersection Map</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cross-strategy visibility &mdash; where leaders' work overlaps or risks duplication</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setViewMode('network')} className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${viewMode === 'network' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Network</button>
          <button onClick={() => setViewMode('matrix')} className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${viewMode === 'matrix' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Matrix</button>
        </div>
      </div>

      {/* KPI Cards */}
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
          <option value="identified">Needs Coordination</option>
          <option value="coordinating">Coordinating</option>
          <option value="acknowledged">Acknowledged</option>
        </select>
        {(themeFilter !== 'All' || strengthFilter !== 'All' || statusFilter !== 'All') && (
          <button onClick={() => { setThemeFilter('All'); setStrengthFilter('All'); setStatusFilter('All'); }} className="text-xs text-accent hover:underline font-medium">Clear filters</button>
        )}
        {selectedNode && (
          <button onClick={() => { setSelectedNode(null); setSelectedEdge(null); }} className="text-xs bg-accent text-white px-3 py-1 rounded-lg font-medium">Clear selection</button>
        )}
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* Main visualization */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          {viewMode === 'network' ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">Network Graph</h2>
                <div className="text-[10px] text-gray-400">Click a node to highlight connections</div>
              </div>
              <svg viewBox="0 0 700 560" className="w-full" style={{ minHeight: 500 }}>
                {/* Edges */}
                {filtered.map(edge => {
                  const posA = nodePositions[edge.leaderAId];
                  const posB = nodePositions[edge.leaderBId];
                  if (!posA || !posB) return null;
                  const highlighted = isEdgeHighlighted(edge);
                  const strokeColor = edge.status === 'identified' ? '#DC2626' : edge.status === 'coordinating' ? '#16A34A' : '#9CA3AF';
                  const strokeWidth = edge.strength === 'strong' ? 3 : edge.strength === 'moderate' ? 2 : 1;
                  return (
                    <line key={edge.id} x1={posA.x} y1={posA.y} x2={posB.x} y2={posB.y}
                      stroke={strokeColor} strokeWidth={strokeWidth}
                      opacity={highlighted ? 0.6 : 0.08}
                      className="cursor-pointer transition-opacity duration-200"
                      onClick={() => { setSelectedEdge(selectedEdge === edge.id ? null : edge.id); setSelectedNode(null); }}
                    />
                  );
                })}
                {/* Nodes */}
                {involved.map(leader => {
                  const pos = nodePositions[leader.id];
                  if (!pos) return null;
                  const count = connectionCounts[leader.id] || 1;
                  const r = Math.max(16, Math.min(30, 12 + count * 4));
                  const color = GROUP_COLORS[leader.group] || '#6B7280';
                  const highlighted = isHighlighted(leader.id);
                  const isSelected = selectedNode === leader.id;
                  return (
                    <g key={leader.id} className="cursor-pointer" onClick={() => { setSelectedNode(selectedNode === leader.id ? null : leader.id); setSelectedEdge(null); }}>
                      <circle cx={pos.x} cy={pos.y} r={r} fill={color}
                        opacity={highlighted ? 0.85 : 0.15}
                        stroke={isSelected ? '#1a1d23' : 'white'} strokeWidth={isSelected ? 3 : 2}
                        className="transition-opacity duration-200"
                      />
                      <text x={pos.x} y={pos.y + r + 14} textAnchor="middle" className="text-[10px] fill-gray-600 font-medium pointer-events-none"
                        opacity={highlighted ? 1 : 0.2}>
                        {leader.name.split(' ').pop()}
                      </text>
                      <text x={pos.x} y={pos.y + 4} textAnchor="middle" className="text-[10px] fill-white font-bold pointer-events-none"
                        opacity={highlighted ? 1 : 0.2}>
                        {count}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {/* Legend */}
              <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-100 flex-wrap">
                <div className="text-[10px] font-semibold text-gray-400 uppercase">Groups:</div>
                {Object.entries(GROUP_COLORS).map(([g, c]) => (
                  <div key={g} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                    <span className="text-[10px] text-gray-500">{g}</span>
                  </div>
                ))}
                <div className="w-px h-4 bg-gray-200" />
                <div className="text-[10px] font-semibold text-gray-400 uppercase">Lines:</div>
                <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-red-500" /><span className="text-[10px] text-gray-500">Needs Coordination</span></div>
                <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-green-500" /><span className="text-[10px] text-gray-500">Coordinating</span></div>
                <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-gray-400" /><span className="text-[10px] text-gray-500">Acknowledged</span></div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="text-[10px] text-gray-400">Node size = # connections &middot; Line thickness = strength</div>
              </div>
            </div>
          ) : (
            /* Matrix View */
            <div className="overflow-x-auto">
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
          )}
        </div>

        {/* Detail Panel */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {selectedNode ? `${getLeader(selectedNode)?.name}'s Connections` : selectedDetail ? 'Connection Detail' : 'All Connections'}
            <span className="text-gray-400 font-normal ml-1">
              ({selectedNode ? selectedNodeConnections.length : filtered.length})
            </span>
          </h2>
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {(selectedNode ? selectedNodeConnections : filtered).map(c => {
              const a = getLeader(c.leaderAId);
              const b = getLeader(c.leaderBId);
              const isOpen = selectedEdge === c.id;
              const statusStyle = c.status === 'identified' ? 'border-l-red-400' : c.status === 'coordinating' ? 'border-l-green-400' : 'border-l-gray-300';

              return (
                <button key={c.id} onClick={() => setSelectedEdge(isOpen ? null : c.id)}
                  className={`w-full text-left bg-white rounded-xl border border-l-4 ${statusStyle} p-4 transition-all ${isOpen ? 'ring-2 ring-accent border-accent' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Link to={`/leaders/${c.leaderAId}`} onClick={e => e.stopPropagation()} className="text-sm font-medium text-accent hover:underline">{c.leaderAName || a?.name}</Link>
                    <span className="text-gray-300">&harr;</span>
                    <Link to={`/leaders/${c.leaderBId}`} onClick={e => e.stopPropagation()} className="text-sm font-medium text-accent hover:underline">{c.leaderBName || b?.name}</Link>
                  </div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className={`w-2 h-2 rounded-full ${c.strength === 'strong' ? 'bg-accent' : c.strength === 'moderate' ? 'bg-amber-400' : 'bg-gray-300'}`} />
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">{c.strength}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${c.status === 'identified' ? 'bg-red-50 text-red-600' : c.status === 'coordinating' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                      {c.status === 'identified' ? 'Needs Coordination' : c.status === 'coordinating' ? 'Coordinating' : 'Acknowledged'}
                    </span>
                    {c.sharedThemes.map(t => <span key={t} className="text-[10px] bg-accent/5 text-accent px-1.5 py-0.5 rounded">{t}</span>)}
                  </div>
                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                      <p className="text-xs text-gray-600">{c.description}</p>
                      {c.leaderAWork && (
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <div className="text-[10px] font-semibold text-gray-500 mb-1">{c.leaderAName} &mdash; {a?.group}</div>
                          <p className="text-xs text-gray-600 leading-relaxed">{c.leaderAWork}</p>
                        </div>
                      )}
                      {c.leaderBWork && (
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <div className="text-[10px] font-semibold text-gray-500 mb-1">{c.leaderBName} &mdash; {b?.group}</div>
                          <p className="text-xs text-gray-600 leading-relaxed">{c.leaderBWork}</p>
                        </div>
                      )}
                      <div className="bg-accent/5 border border-accent/10 rounded-lg p-2.5">
                        <div className="text-[10px] text-accent font-semibold mb-0.5">Recommended Action</div>
                        <p className="text-xs text-gray-700 leading-relaxed">{c.suggestedAction}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/leaders/${c.leaderAId}`} onClick={e => e.stopPropagation()} className="text-[10px] bg-accent text-white px-2 py-1 rounded font-medium hover:bg-accent/90">View {c.leaderAName?.split(' ').pop()}'s Page</Link>
                        <Link to={`/leaders/${c.leaderBId}`} onClick={e => e.stopPropagation()} className="text-[10px] bg-accent text-white px-2 py-1 rounded font-medium hover:bg-accent/90">View {c.leaderBName?.split(' ').pop()}'s Page</Link>
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
