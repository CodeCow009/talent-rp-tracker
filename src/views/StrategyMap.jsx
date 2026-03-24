import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import { leaders, intersections, getLeader } from '../data';

const THEMES = ['All', 'GenAI', 'FSI', 'APAC', 'Workforce', 'Methodology', 'Banking', 'HRTech', 'Messaging', 'Delivery', 'Profitability'];

export default function StrategyMap() {
  const [themeFilter, setThemeFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = themeFilter === 'All'
    ? intersections
    : intersections.filter(i => i.sharedThemes.some(t => t.toLowerCase().includes(themeFilter.toLowerCase())));

  const involvedIds = [...new Set(filtered.flatMap(i => [i.leaderA, i.leaderB]))];
  const involved = involvedIds.map(id => getLeader(id)).filter(Boolean);
  const allThemes = [...new Set(filtered.flatMap(i => i.sharedThemes))];

  const intensity = {};
  involvedIds.forEach(lid => {
    intensity[lid] = {};
    allThemes.forEach(t => {
      intensity[lid][t] = filtered.filter(i => (i.leaderA === lid || i.leaderB === lid) && i.sharedThemes.includes(t)).length;
    });
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Strategy Intersection Map</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} connections &middot; {involvedIds.length} leaders</p>
        </div>
        <select value={themeFilter} onChange={e => setThemeFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          {THEMES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-auto">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Theme Intensity Matrix</h2>
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left px-2 py-1.5 font-semibold text-gray-500 sticky left-0 bg-white">Leader</th>
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
                  <td className="px-2 py-1.5 sticky left-0 bg-white">
                    <Link to={`/leaders/${l.id}`} className="text-gray-700 hover:text-accent font-medium">{l.name}</Link>
                    <div className="text-[10px] text-gray-400">{l.group}</div>
                  </td>
                  {allThemes.map(t => {
                    const val = intensity[l.id]?.[t] || 0;
                    const bg = val === 0 ? 'bg-gray-50' : val === 1 ? 'bg-accent/20' : 'bg-accent/50';
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

        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Connections</h2>
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filtered.map(c => {
              const a = getLeader(c.leaderA);
              const b = getLeader(c.leaderB);
              const open = selected === c.id;
              return (
                <button key={c.id} onClick={() => setSelected(open ? null : c.id)}
                  className={`w-full text-left bg-white rounded-xl border p-4 transition-all ${open ? 'ring-2 ring-accent border-accent' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium text-gray-800">{a?.name}</span>
                    <span className="text-gray-300">&harr;</span>
                    <span className="text-sm font-medium text-gray-800">{b?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className={`w-2 h-2 rounded-full ${c.strength === 'strong' ? 'bg-accent' : c.strength === 'moderate' ? 'bg-amber-400' : 'bg-gray-300'}`} />
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">{c.strength}</span>
                    {c.sharedThemes.map(t => <span key={t} className="text-[10px] bg-accent/5 text-accent px-1.5 py-0.5 rounded">{t}</span>)}
                  </div>
                  {open && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600 mb-2">{c.description}</p>
                      <div className="bg-accent/5 rounded-lg p-2">
                        <div className="text-[10px] text-accent font-semibold mb-0.5">Suggested Action</div>
                        <p className="text-xs text-gray-600">{c.suggestedAction}</p>
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
