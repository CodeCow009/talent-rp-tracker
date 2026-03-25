import { useState } from 'react';
import LeaderCard from '../components/LeaderCard';
import { leaders, financials, GROUPS, getLeader } from '../data';

export default function AllLeaders({ persona }) {
  const isLeaderOrDeputy = persona?.role === 'Leader' || persona?.role === 'Deputy';
  const myLeader = isLeaderOrDeputy ? getLeader(persona.leaderId) : null;
  const myGroup = myLeader?.group;

  const [group, setGroup] = useState(isLeaderOrDeputy ? myGroup : 'All');
  const [health, setHealth] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = leaders
    .filter(l => l.id !== 'leader-24')
    .filter(l => isLeaderOrDeputy ? l.group === myGroup : (group === 'All' || l.group === group))
    .filter(l => health === 'All' || l.overallHealth === health)
    .filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.subGroup.toLowerCase().includes(search.toLowerCase()));

  const title = isLeaderOrDeputy ? `My Group — ${myGroup}` : 'All Leaders';
  const subtitle = isLeaderOrDeputy
    ? `${filtered.length} peers in ${myGroup}`
    : `${filtered.length} leaders`;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-accent" />
          {!isLeaderOrDeputy && (
            <select value={group} onChange={e => setGroup(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
              <option>All</option>
              {GROUPS.map(g => <option key={g}>{g}</option>)}
            </select>
          )}
          <select value={health} onChange={e => setHealth(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
            <option value="All">All Status</option>
            <option value="green">On Track</option>
            <option value="watch">Watch</option>
            <option value="risk">At Risk</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {filtered.map(l => {
          const isMe = l.id === persona?.leaderId;
          return (
            <div key={l.id} className={isMe ? 'ring-2 ring-accent rounded-xl' : ''}>
              <LeaderCard leader={l} financial={financials.find(f => f.leaderId === l.id)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
