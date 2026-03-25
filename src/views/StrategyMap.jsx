import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import { intersections, getLeader, financials, leaders, GROUPS } from '../data';

const GROUP_COLORS = {
  Offerings: '#2563EB', Markets: '#7C3AED', Industries: '#059669',
  Engines: '#D97706', 'Growth & Strategy': '#DC2626',
};
const GROUP_ORDER = ['Offerings', 'Markets', 'Industries', 'Engines', 'Growth & Strategy'];
const THEMES = ['All', 'GenAI', 'FSI', 'APAC', 'Workforce', 'Methodology', 'Banking', 'HRTech', 'Messaging', 'Delivery', 'Profitability'];

// Clustered layout: each group gets a sector of the circle, nodes fan within that sector
function computeLayout(involved, width, height) {
  const cx = width / 2, cy = height / 2;
  const outerR = Math.min(cx, cy) - 70; // main ring radius
  const positions = {};

  // Group members
  const grouped = {};
  GROUP_ORDER.forEach(g => { grouped[g] = []; });
  involved.forEach(l => {
    if (grouped[l.group]) grouped[l.group].push(l);
  });

  const activeGroups = GROUP_ORDER.filter(g => grouped[g].length > 0);
  const gapAngle = 0.28; // radians gap between groups
  const totalGap = gapAngle * activeGroups.length;
  const totalArc = 2 * Math.PI - totalGap;

  // How much arc each group gets, proportional to member count
  const totalMembers = involved.length || 1;
  let currentAngle = -Math.PI / 2; // start at top

  const groupLabelPositions = {};

  activeGroups.forEach(g => {
    const members = grouped[g];
    const arcLen = (members.length / totalMembers) * totalArc;
    const startAngle = currentAngle;
    const endAngle = currentAngle + arcLen;
    const midAngle = (startAngle + endAngle) / 2;

    // Group label position (further out)
    groupLabelPositions[g] = {
      x: cx + (outerR + 48) * Math.cos(midAngle),
      y: cy + (outerR + 48) * Math.sin(midAngle),
      angle: midAngle,
    };

    if (members.length === 1) {
      positions[members[0].id] = {
        x: cx + outerR * Math.cos(midAngle),
        y: cy + outerR * Math.sin(midAngle),
        labelAngle: midAngle,
      };
    } else {
      members.forEach((l, i) => {
        const t = members.length > 1 ? i / (members.length - 1) : 0.5;
        const angle = startAngle + t * arcLen;
        positions[l.id] = {
          x: cx + outerR * Math.cos(angle),
          y: cy + outerR * Math.sin(angle),
          labelAngle: angle,
        };
      });
    }

    currentAngle = endAngle + gapAngle;
  });

  return { positions, groupLabelPositions };
}

// Curved edge path: quadratic bezier curving toward center
function edgePath(x1, y1, x2, y2, cx, cy) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  // Pull control point toward center by 30%
  const cpx = mx + (cx - mx) * 0.35;
  const cpy = my + (cy - my) * 0.35;
  return `M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`;
}

const W = 780, H = 620;

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

  const { positions: nodePositions, groupLabelPositions } = useMemo(
    () => computeLayout(involved, W, H), [involved]
  );

  const connectionCounts = useMemo(() => {
    const counts = {};
    filtered.forEach(i => {
      counts[i.leaderAId] = (counts[i.leaderAId] || 0) + 1;
      counts[i.leaderBId] = (counts[i.leaderBId] || 0) + 1;
    });
    return counts;
  }, [filtered]);

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

  const cx = W / 2, cy = H / 2;

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

      {/* KPI Cards — clickable to filter */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <button onClick={() => { setStatusFilter('All'); setSelectedNode(null); setSelectedEdge(null); }}
          className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${statusFilter === 'All' && !selectedNode ? 'ring-2 ring-accent border-accent' : 'border-gray-200'}`}>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Connections</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{intersections.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">across {involvedIds.length} leaders</div>
        </button>
        <button onClick={() => { setStatusFilter(statusFilter === 'identified' ? 'All' : 'identified'); setSelectedNode(null); setSelectedEdge(null); }}
          className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${statusFilter === 'identified' ? 'ring-2 ring-red-400 border-red-200' : 'border-red-100'}`}>
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">Needs Coordination</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{identifiedCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">click to filter</div>
        </button>
        <button onClick={() => { setStatusFilter(statusFilter === 'coordinating' ? 'All' : 'coordinating'); setSelectedNode(null); setSelectedEdge(null); }}
          className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${statusFilter === 'coordinating' ? 'ring-2 ring-green-400 border-green-200' : 'border-green-100'}`}>
          <div className="text-xs font-semibold text-green-500 uppercase tracking-wider">Actively Coordinating</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{coordinatingCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">click to filter</div>
        </button>
        <button onClick={() => { setStatusFilter(statusFilter === 'identified' ? 'All' : 'identified'); setSelectedNode(null); setSelectedEdge(null); }}
          className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${statusFilter === 'identified' ? 'ring-2 ring-amber-400 border-amber-200' : 'border-amber-100'}`}>
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Pipeline at Stake</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">${(atRiskPipeline / 1e6).toFixed(0)}M</div>
          <div className="text-xs text-gray-500 mt-0.5">from uncoordinated leaders</div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
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
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          {viewMode === 'network' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-700">Network Graph</h2>
                <div className="text-[10px] text-gray-400">Click a node to highlight its connections</div>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minHeight: 520 }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Group sector arcs (subtle background) */}
                {Object.entries(groupLabelPositions).map(([g, pos]) => {
                  const color = GROUP_COLORS[g] || '#6B7280';
                  // Nudge specific labels away from nearby node names
                  const nudgeX = g === 'Offerings' ? 15 : g === 'Growth & Strategy' ? -15 : 0;
                  const nudgeY = g === 'Offerings' ? -12 : g === 'Growth & Strategy' ? -12 : 0;
                  return (
                    <text key={`glbl-${g}`} x={pos.x + nudgeX} y={pos.y + nudgeY}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={color} fontSize="11" fontWeight="700" opacity="0.5"
                      className="pointer-events-none select-none">
                      {g === 'Growth & Strategy' ? 'G & S' : g}
                    </text>
                  );
                })}

                {/* Edges — curved */}
                {filtered.map(edge => {
                  const posA = nodePositions[edge.leaderAId];
                  const posB = nodePositions[edge.leaderBId];
                  if (!posA || !posB) return null;
                  const highlighted = isEdgeHighlighted(edge);
                  const strokeColor = edge.status === 'identified' ? '#DC2626' : edge.status === 'coordinating' ? '#16A34A' : '#9CA3AF';
                  const strokeWidth = edge.strength === 'strong' ? 2.5 : edge.strength === 'moderate' ? 1.5 : 0.8;
                  const dashArray = edge.strength === 'weak' ? '4,3' : 'none';
                  return (
                    <path key={edge.id}
                      d={edgePath(posA.x, posA.y, posB.x, posB.y, cx, cy)}
                      fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
                      strokeDasharray={dashArray}
                      opacity={highlighted ? 0.5 : 0.06}
                      className="cursor-pointer transition-opacity duration-300"
                      onClick={() => { setSelectedEdge(selectedEdge === edge.id ? null : edge.id); setSelectedNode(null); }}
                    />
                  );
                })}

                {/* Nodes */}
                {involved.map(leader => {
                  const pos = nodePositions[leader.id];
                  if (!pos) return null;
                  const count = connectionCounts[leader.id] || 1;
                  const r = Math.max(14, Math.min(26, 10 + count * 3));
                  const color = GROUP_COLORS[leader.group] || '#6B7280';
                  const highlighted = isHighlighted(leader.id);
                  const isSelected = selectedNode === leader.id;

                  // Label placement: radiate outward from center
                  const labelDist = r + 10;
                  const labelAngle = pos.labelAngle ?? 0;
                  const lx = pos.x + labelDist * Math.cos(labelAngle);
                  const ly = pos.y + labelDist * Math.sin(labelAngle);
                  // Text anchor: left/right based on which half
                  const anchor = Math.abs(labelAngle) > Math.PI / 2 ? 'end' : 'start';
                  const lastName = leader.name.split(' ').pop();
                  const firstName = leader.name.split(' ')[0]?.[0] + '.';

                  return (
                    <g key={leader.id} className="cursor-pointer"
                      onClick={() => { setSelectedNode(selectedNode === leader.id ? null : leader.id); setSelectedEdge(null); }}>
                      {/* Hover ring */}
                      {isSelected && (
                        <circle cx={pos.x} cy={pos.y} r={r + 5} fill="none" stroke={color} strokeWidth={2} opacity={0.3} filter="url(#glow)" />
                      )}
                      <circle cx={pos.x} cy={pos.y} r={r} fill={color}
                        opacity={highlighted ? 0.9 : 0.12}
                        stroke={isSelected ? '#1a1d23' : '#fff'} strokeWidth={isSelected ? 2.5 : 1.5}
                        className="transition-opacity duration-300"
                      />
                      {/* Count inside node */}
                      <text x={pos.x} y={pos.y + 4} textAnchor="middle"
                        fill="white" fontSize="10" fontWeight="700"
                        opacity={highlighted ? 1 : 0.15}
                        className="pointer-events-none select-none">
                        {count}
                      </text>
                      {/* Name label outside */}
                      <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
                        fill="#374151" fontSize="9.5" fontWeight="600"
                        opacity={highlighted ? 0.9 : 0.15}
                        className="pointer-events-none select-none">
                        {firstName} {lastName}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="flex items-center gap-5 mt-2 pt-3 border-t border-gray-100 flex-wrap text-[10px]">
                <span className="font-semibold text-gray-400 uppercase">Groups:</span>
                {Object.entries(GROUP_COLORS).map(([g, c]) => (
                  <div key={g} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                    <span className="text-gray-500">{g === 'Growth & Strategy' ? 'G&S' : g}</span>
                  </div>
                ))}
                <span className="text-gray-200">|</span>
                <span className="font-semibold text-gray-400 uppercase">Edges:</span>
                <div className="flex items-center gap-1"><svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke="#DC2626" strokeWidth="2"/></svg><span className="text-gray-500">Needs Action</span></div>
                <div className="flex items-center gap-1"><svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke="#16A34A" strokeWidth="2"/></svg><span className="text-gray-500">Coordinating</span></div>
                <div className="flex items-center gap-1"><svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4,3"/></svg><span className="text-gray-500">Acknowledged</span></div>
                <span className="text-gray-200">|</span>
                <span className="text-gray-400">Size = connections &middot; Thick = strong &middot; Thin/dashed = weak</span>
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
            {selectedNode ? `${getLeader(selectedNode)?.name}'s Connections` : 'All Connections'}
            <span className="text-gray-400 font-normal ml-1">({selectedNode ? selectedNodeConnections.length : filtered.length})</span>
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
