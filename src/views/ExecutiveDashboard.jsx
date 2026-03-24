import { useState } from 'react';
import { Link } from 'react-router-dom';
import KPICard from '../components/KPICard';
import LeaderCard from '../components/LeaderCard';
import StatusChip from '../components/StatusChip';
import { leaders, financials, narratives, fmt, GROUPS, daysSinceUpdate } from '../data';

function getGroupHealth(group) {
  const gl = leaders.filter(l => l.group === group && l.id !== 'leader-24');
  const gf = gl.map(l => financials.find(f => f.leaderId === l.id)).filter(Boolean);
  const avgRev = gf.length ? Math.round(gf.reduce((s, f) => s + f.revenuePctToTarget, 0) / gf.length) : 0;
  return { avgRev, leaders: gl.length, health: avgRev >= 85 ? 'green' : avgRev >= 70 ? 'watch' : 'risk' };
}

const SENTIMENT_FILTERS = [
  { value: 'all', label: 'All Updates' },
  { value: 'escalation', label: 'Escalation', color: 'bg-red-100 text-red-700' },
  { value: 'cautious', label: 'Cautious', color: 'bg-amber-100 text-amber-700' },
  { value: 'positive', label: 'Positive', color: 'bg-green-100 text-green-700' },
  { value: 'neutral', label: 'Neutral', color: 'bg-gray-100 text-gray-600' },
];

export default function ExecutiveDashboard() {
  const [groupFilter, setGroupFilter] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('all');

  const activeLeaders = leaders.filter(l => l.id !== 'leader-24');
  const totalRevTarget = financials.reduce((s, f) => s + f.revenueTarget, 0);
  const totalRevActual = financials.reduce((s, f) => s + f.revenueActual, 0);
  const totalPipeline = financials.reduce((s, f) => s + f.pipelineValue, 0);
  const avgPipelineCov = (financials.reduce((s, f) => s + f.pipelineCoverage, 0) / financials.length).toFixed(1);
  const updatedCount = activeLeaders.filter(l => daysSinceUpdate(l.lastUpdated) <= 7).length;
  const staleLeaders = activeLeaders.filter(l => daysSinceUpdate(l.lastUpdated) > 14)
    .sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated));
  const escalations = narratives.filter(n => n.sentiment === 'escalation');
  const filtered = groupFilter === 'All' ? activeLeaders : activeLeaders.filter(l => l.group === groupFilter);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Talent RP Strategy Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Executive Dashboard &middot; Q3 FY26</p>
        </div>
        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent">
          <option>All</option>
          {GROUPS.map(g => <option key={g}>{g}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Revenue" value={fmt(totalRevActual)} sub={`of ${fmt(totalRevTarget)}`} trend={`${Math.round(totalRevActual / totalRevTarget * 100)}%`} />
        <KPICard label="Pipeline" value={fmt(totalPipeline)} sub={`${avgPipelineCov}x avg coverage`} trend="Healthy" />
        <KPICard label="Objectives" value="68% On Track" sub="4 at risk" trend="▼ -3%" />
        <KPICard label="Leaders Updated" value={`${updatedCount} / ${activeLeaders.length}`} sub={`${staleLeaders.length} stale`} trend={staleLeaders.length > 4 ? '▼ Needs attention' : '▲ Good'} />
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        {GROUPS.map(g => {
          const h = getGroupHealth(g);
          return (
            <button key={g} onClick={() => setGroupFilter(groupFilter === g ? 'All' : g)}
              className={`bg-white rounded-xl border p-4 text-left transition-all ${groupFilter === g ? 'ring-2 ring-accent border-accent' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{g}</div>
              <StatusChip status={h.health} className="mt-1" />
              <div className="text-xs text-gray-500 mt-2">{h.avgRev}% rev &middot; {h.leaders} leads</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Leader Health Grid</h2>
          <div className="grid grid-cols-4 gap-3">
            {filtered.map(l => <LeaderCard key={l.id} leader={l} financial={financials.find(f => f.leaderId === l.id)} />)}
          </div>
        </div>

        <div className="space-y-4">
          {/* Narrative Feed with Sentiment Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Leader Updates</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SENTIMENT_FILTERS.map(sf => (
                <button
                  key={sf.value}
                  onClick={() => setSentimentFilter(sentimentFilter === sf.value ? 'all' : sf.value)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full transition-all ${
                    sentimentFilter === sf.value
                      ? (sf.color || 'bg-accent text-white') + ' ring-1 ring-offset-1 ring-gray-300'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {sf.label}
                  {sf.value !== 'all' && (
                    <span className="ml-1 opacity-70">
                      ({narratives.filter(n => n.sentiment === sf.value).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {narratives
                .filter(n => sentimentFilter === 'all' || n.sentiment === sentimentFilter)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 15)
                .map(n => {
                  const leader = leaders.find(l => l.id === n.leaderId);
                  return (
                    <Link key={n.id} to={`/leaders/${n.leaderId}`} className="block py-2 hover:bg-gray-50 -mx-2 px-2 rounded border-l-2 border-transparent hover:border-accent/30">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-medium text-gray-700">{leader?.name}</span>
                        <StatusChip status={n.sentiment} />
                      </div>
                      <div className="text-[10px] text-accent/60 font-medium">{n.topic}</div>
                      <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.content}</div>
                      <div className="text-[10px] text-gray-300 mt-0.5">{n.date}</div>
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Stale Updates */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Stale Updates</h3>
            {staleLeaders.slice(0, 5).map(l => (
              <Link key={l.id} to={`/leaders/${l.id}`} className="flex items-center justify-between py-1.5 hover:bg-gray-50 -mx-2 px-2 rounded">
                <span className="text-sm text-gray-700">{l.name}</span>
                <span className="text-xs text-red-500 font-medium">{daysSinceUpdate(l.lastUpdated)}d</span>
              </Link>
            ))}
          </div>

          {/* Intersections */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Strategy Intersections</h3>
            <p className="text-sm text-gray-600">18 connections detected across leaders.</p>
            <Link to="/strategy-map" className="text-sm text-accent font-medium mt-2 inline-block hover:underline">View Strategy Map &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
