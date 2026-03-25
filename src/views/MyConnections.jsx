import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import ProgressBar from '../components/ProgressBar';
import { getLeader, getLeaderIntersections, getLeaderKeyResults, getLeaderCampaigns, getFinancials, fmt } from '../data';

export default function MyConnections({ persona }) {
  const leaderId = persona?.leaderId;
  const leader = getLeader(leaderId);
  const connections = getLeaderIntersections(leaderId);
  const myKRs = getLeaderKeyResults(leaderId);
  const myCampaigns = getLeaderCampaigns(leaderId);
  const myFin = getFinancials(leaderId);
  const [expandedId, setExpandedId] = useState(null);

  if (!leader) return <div className="p-6 text-gray-500">Leader not found.</div>;

  const uncoordinated = connections.filter(c => c.status === 'identified');
  const coordinating = connections.filter(c => c.status === 'coordinating');
  const acknowledged = connections.filter(c => c.status === 'acknowledged');

  // Unique connected leaders
  const connectedIds = [...new Set(connections.flatMap(c => [c.leaderAId, c.leaderBId]).filter(id => id !== leaderId))];
  const connectedLeaders = connectedIds.map(id => getLeader(id)).filter(Boolean);

  // Shared themes
  const allThemes = [...new Set(connections.flatMap(c => c.sharedThemes))];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">My Strategy Connections</h1>
        <p className="text-sm text-gray-500 mt-0.5">{leader.name} &middot; {leader.group} &middot; {connections.length} connections with other leaders</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase">Connections</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{connections.length}</div>
          <div className="text-xs text-gray-500">with {connectedLeaders.length} leaders</div>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-4">
          <div className="text-xs font-semibold text-red-400 uppercase">Needs Coordination</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{uncoordinated.length}</div>
          <div className="text-xs text-gray-500">overlaps not yet aligned</div>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-4">
          <div className="text-xs font-semibold text-green-500 uppercase">Coordinating</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{coordinating.length}</div>
          <div className="text-xs text-gray-500">actively working together</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase">Shared Themes</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{allThemes.length}</div>
          <div className="flex gap-1 mt-1 flex-wrap">{allThemes.slice(0, 4).map(t => <span key={t} className="text-[9px] bg-accent/5 text-accent px-1 py-0.5 rounded">{t}</span>)}</div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Connection Cards */}
        <div>
          {/* Needs Coordination — priority */}
          {uncoordinated.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" /> Needs Your Coordination ({uncoordinated.length})
              </h2>
              <div className="space-y-3">
                {uncoordinated.map(c => <ConnectionCard key={c.id} c={c} leaderId={leaderId} expanded={expandedId === c.id} onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)} />)}
              </div>
            </div>
          )}

          {coordinating.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" /> Actively Coordinating ({coordinating.length})
              </h2>
              <div className="space-y-3">
                {coordinating.map(c => <ConnectionCard key={c.id} c={c} leaderId={leaderId} expanded={expandedId === c.id} onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)} />)}
              </div>
            </div>
          )}

          {acknowledged.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full" /> Acknowledged ({acknowledged.length})
              </h2>
              <div className="space-y-3">
                {acknowledged.map(c => <ConnectionCard key={c.id} c={c} leaderId={leaderId} expanded={expandedId === c.id} onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)} />)}
              </div>
            </div>
          )}
        </div>

        {/* Right panel: My connected leaders */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Connected Leaders</h2>
          <div className="space-y-2">
            {connectedLeaders.map(l => {
              const fin = getFinancials(l.id);
              const sharedConns = connections.filter(c => c.leaderAId === l.id || c.leaderBId === l.id);
              const themes = [...new Set(sharedConns.flatMap(c => c.sharedThemes))];
              return (
                <Link key={l.id} to={`/leaders/${l.id}`} className="block bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold">{l.avatar}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{l.name}</div>
                      <div className="text-[10px] text-gray-400">{l.title} &middot; {l.group}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {themes.map(t => <span key={t} className="text-[9px] bg-accent/5 text-accent px-1 py-0.5 rounded">{t}</span>)}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">{sharedConns.length} shared connection{sharedConns.length !== 1 ? 's' : ''}</div>
                </Link>
              );
            })}
          </div>

          {/* My quick stats */}
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">My Quick Stats</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Key Results</span><span className="font-semibold">{myKRs.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">At Risk</span><span className="font-semibold text-red-500">{myKRs.filter(k => k.status === 'at_risk' || k.status === 'behind').length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Campaigns</span><span className="font-semibold">{myCampaigns.length}</span></div>
              {myFin && <div className="flex justify-between"><span className="text-gray-500">Revenue</span><span className="font-semibold">{myFin.revenuePctToTarget}%</span></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectionCard({ c, leaderId, expanded, onToggle }) {
  const otherId = c.leaderAId === leaderId ? c.leaderBId : c.leaderAId;
  const otherName = c.leaderAId === leaderId ? c.leaderBName : c.leaderAName;
  const other = getLeader(otherId);
  const myWork = c.leaderAId === leaderId ? c.leaderAWork : c.leaderBWork;
  const theirWork = c.leaderAId === leaderId ? c.leaderBWork : c.leaderAWork;
  const statusStyle = c.status === 'identified' ? 'border-l-red-400' : c.status === 'coordinating' ? 'border-l-green-400' : 'border-l-gray-300';

  return (
    <button onClick={onToggle} className={`w-full text-left bg-white rounded-xl border border-l-4 ${statusStyle} p-4 transition-all ${expanded ? 'ring-2 ring-accent border-accent' : 'border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[9px] font-bold">{other?.avatar}</div>
        <Link to={`/leaders/${otherId}`} onClick={e => e.stopPropagation()} className="text-sm font-medium text-accent hover:underline">{otherName || other?.name}</Link>
        <span className="text-[10px] text-gray-400">{other?.group}</span>
      </div>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${c.status === 'identified' ? 'bg-red-50 text-red-600' : c.status === 'coordinating' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
          {c.status === 'identified' ? 'Needs Coordination' : c.status === 'coordinating' ? 'Coordinating' : 'Acknowledged'}
        </span>
        <span className="text-[10px] text-gray-400 uppercase font-semibold">{c.strength}</span>
        {c.sharedThemes.map(t => <span key={t} className="text-[10px] bg-accent/5 text-accent px-1.5 py-0.5 rounded">{t}</span>)}
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          <p className="text-xs text-gray-600">{c.description}</p>
          {myWork && (
            <div className="bg-accent/5 rounded-lg p-2.5">
              <div className="text-[10px] font-semibold text-accent mb-0.5">Your Work</div>
              <p className="text-xs text-gray-600 leading-relaxed">{myWork}</p>
            </div>
          )}
          {theirWork && (
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="text-[10px] font-semibold text-gray-500 mb-0.5">{otherName}'s Work</div>
              <p className="text-xs text-gray-600 leading-relaxed">{theirWork}</p>
            </div>
          )}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5">
            <div className="text-[10px] text-amber-600 font-semibold mb-0.5">Recommended Action</div>
            <p className="text-xs text-gray-700 leading-relaxed">{c.suggestedAction}</p>
          </div>
          <Link to={`/leaders/${otherId}`} onClick={e => e.stopPropagation()} className="text-[10px] bg-accent text-white px-2 py-1 rounded font-medium hover:bg-accent/90 inline-block">
            View {otherName?.split(' ').pop()}'s Strategy Page
          </Link>
        </div>
      )}
    </button>
  );
}
