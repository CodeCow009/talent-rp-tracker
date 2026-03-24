import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import KPICard from '../components/KPICard';
import ProgressBar from '../components/ProgressBar';
import StatusChip from '../components/StatusChip';
import { leaders, financials, narratives, fmt, GROUPS } from '../data';

const GROUP_COLORS = {
  Offerings: '#2563EB', Markets: '#7C3AED', Industries: '#059669',
  Engines: '#D97706', 'Growth & Strategy': '#DC2626',
};

export default function OperationsDashboard() {
  const [sortKey, setSortKey] = useState('revenuePctToTarget');
  const [sortDir, setSortDir] = useState('asc');

  const totalRevTarget = financials.reduce((s, f) => s + f.revenueTarget, 0);
  const totalRevActual = financials.reduce((s, f) => s + f.revenueActual, 0);
  const totalPipeline = financials.reduce((s, f) => s + f.pipelineValue, 0);
  const avgCharge = (financials.reduce((s, f) => s + f.chargeability, 0) / financials.length).toFixed(1);
  const avgMargin = (financials.reduce((s, f) => s + f.profitabilityMargin, 0) / financials.length).toFixed(1);

  const rows = leaders.filter(l => l.id !== 'leader-24').map(l => {
    const f = financials.find(x => x.leaderId === l.id);
    return { ...l, ...f };
  }).sort((a, b) => {
    const va = typeof a[sortKey] === 'string' ? a[sortKey] : (a[sortKey] ?? 0);
    const vb = typeof b[sortKey] === 'string' ? b[sortKey] : (b[sortKey] ?? 0);
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const groupData = GROUPS.map(g => {
    const gf = leaders.filter(l => l.group === g && l.id !== 'leader-24').map(l => financials.find(f => f.leaderId === l.id)).filter(Boolean);
    return {
      name: g.length > 10 ? 'G&S' : g,
      actual: gf.reduce((s, f) => s + f.revenueActual, 0),
      target: gf.reduce((s, f) => s + f.revenueTarget, 0),
    };
  });

  const scatterData = rows.map(r => ({
    x: r.pipelineCoverage || 0, y: r.winRate || 0,
    z: (r.revenueActual || 1e6) / 1e6, name: r.name, group: r.group,
  }));

  const Arrow = ({ col }) => <span className="ml-1 text-gray-300">{sortKey === col ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Operations Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Financial & Operational Performance &middot; Q3 FY26</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Revenue" value={fmt(totalRevActual)} sub={`of ${fmt(totalRevTarget)}`} trend={`${Math.round(totalRevActual / totalRevTarget * 100)}%`} />
        <KPICard label="Total Pipeline" value={fmt(totalPipeline)} />
        <KPICard label="Avg Chargeability" value={`${avgCharge}%`} />
        <KPICard label="Avg Margin" value={`${avgMargin}%`} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {[['name','Leader'],['group','Group'],['revenueTarget','Rev Target'],['revenueActual','Rev Actual'],['revenuePctToTarget','%'],['pipelineValue','Pipeline'],['pipelineCoverage','Cov'],['winRate','Win%'],['profitabilityMargin','Marg%'],['chargeability','Chg%']].map(([k,l]) => (
                  <th key={k} onClick={() => handleSort(k)} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none whitespace-nowrap">
                    {l}<Arrow col={k} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-3 py-2.5"><Link to={`/leaders/${r.id}`} className="font-medium text-gray-900 hover:text-accent">{r.name}</Link></td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{r.group}</td>
                  <td className="px-3 py-2.5 text-gray-700">{fmt(r.revenueTarget)}</td>
                  <td className="px-3 py-2.5 text-gray-700">{fmt(r.revenueActual)}</td>
                  <td className="px-3 py-2.5 w-28"><ProgressBar value={r.revenuePctToTarget} size="sm" /></td>
                  <td className="px-3 py-2.5 text-gray-700">{fmt(r.pipelineValue)}</td>
                  <td className="px-3 py-2.5 text-gray-600">{r.pipelineCoverage}x</td>
                  <td className="px-3 py-2.5 text-gray-600">{r.winRate}%</td>
                  <td className="px-3 py-2.5 text-gray-600">{r.profitabilityMargin}%</td>
                  <td className="px-3 py-2.5 text-gray-600">{r.chargeability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue by Group</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={groupData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `$${(v/1e6).toFixed(0)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => fmt(v)} />
              <Legend />
              <Bar dataKey="actual" name="Actual" fill="#2563EB" radius={[4,4,0,0]} />
              <Bar dataKey="target" name="Target" fill="#E5E7EB" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Pipeline Health</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" dataKey="x" name="Coverage" tick={{ fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="Win Rate" tick={{ fontSize: 11 }} />
              <ZAxis type="number" dataKey="z" range={[40, 400]} />
              <Tooltip content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0]?.payload;
                return <div className="bg-white shadow-lg rounded-lg border p-2 text-xs"><div className="font-semibold">{d?.name}</div><div>Coverage: {d?.x}x &middot; Win: {d?.y}%</div></div>;
              }} />
              <ReferenceLine x={1.4} stroke="#d1d5db" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="#d1d5db" strokeDasharray="3 3" />
              <Scatter data={scatterData}>
                {scatterData.map((e, i) => <Cell key={i} fill={GROUP_COLORS[e.group] || '#6B7280'} fillOpacity={0.7} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Escalation & Risk Feed */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Escalations & Risks from Leaders</h3>
        <div className="grid grid-cols-2 gap-3">
          {narratives
            .filter(n => n.sentiment === 'escalation' || n.sentiment === 'cautious')
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(n => {
              const leader = leaders.find(l => l.id === n.leaderId);
              const f = financials.find(x => x.leaderId === n.leaderId);
              return (
                <Link key={n.id} to={`/leaders/${n.leaderId}`} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">{leader?.name}</span>
                    <StatusChip status={n.sentiment} />
                    {f && <span className="text-[10px] text-gray-400">Rev: {f.revenuePctToTarget}%</span>}
                  </div>
                  <div className="text-[10px] text-accent/60 font-medium">{n.topic}</div>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{n.content}</p>
                  <div className="text-[10px] text-gray-300 mt-1">{n.date}</div>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
