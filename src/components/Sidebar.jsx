import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { leaders, actionItems, intersections, keyResults, meetings, getLeaderActionItems, getLeaderIntersections, getLeaderKeyResults, daysSinceUpdate } from '../data';
import NotificationBell from './NotificationBell';

const ICONS = {
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4',
  leaders: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  strategyMap: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0h6m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4',
  connections: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  actionItems: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  cadences: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  content: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  myPage: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  groupPeers: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
};

const ROLE_STYLES = {
  Executive: { bg: 'bg-purple-500', ring: 'ring-purple-400/30', label: 'text-purple-300' },
  Operations: { bg: 'bg-blue-500', ring: 'ring-blue-400/30', label: 'text-blue-300' },
  Strategy: { bg: 'bg-emerald-500', ring: 'ring-emerald-400/30', label: 'text-emerald-300' },
  Leader: { bg: 'bg-accent', ring: 'ring-accent/30', label: 'text-accent' },
  Deputy: { bg: 'bg-amber-500', ring: 'ring-amber-400/30', label: 'text-amber-300' },
};

function getNavItems(persona) {
  const role = persona?.role;
  const leaderId = persona?.leaderId;

  if (role === 'Leader' || role === 'Deputy') {
    const myActions = getLeaderActionItems(leaderId);
    const myIntersections = getLeaderIntersections(leaderId);
    const myKRs = getLeaderKeyResults(leaderId);
    const myOverdue = myActions.filter(a => a.status === 'overdue').length;
    const myOpen = myActions.filter(a => a.status !== 'completed' && a.status !== 'complete').length;
    const myConnections = myIntersections.length;
    const myAtRisk = myKRs.filter(k => k.status === 'at_risk' || k.status === 'behind').length;
    const myMeetings = meetings.filter(m => m.attendees?.includes(leaderId));
    const myPending = myMeetings.filter(m => m.status === 'pending_review').length;
    const leader = leaders.find(l => l.id === leaderId);
    const groupPeers = leaders.filter(l => l.group === leader?.group && l.id !== leaderId && l.id !== 'leader-24').length;

    return [
      { to: `/leaders/${leaderId}`, label: 'My Strategy Page', icon: ICONS.myPage },
      { to: '/leaders', label: 'My Group', icon: ICONS.groupPeers, sub: `${groupPeers} peers in ${leader?.group}` },
      { to: '/strategy-map', label: 'My Connections', icon: ICONS.connections, sub: `${myConnections} connections · ${myAtRisk} KRs at risk` },
      { to: '/action-items', label: 'My Actions', icon: ICONS.actionItems, sub: `${myOpen} open · ${myOverdue} overdue` },
      { to: '/cadences', label: 'My Cadences', icon: ICONS.cadences, sub: `${myMeetings.length} meetings · ${myPending} pending` },
      { to: '/content', label: 'Resources', icon: ICONS.content },
    ];
  }

  if (role === 'Operations') {
    const totalOverdue = actionItems.filter(a => a.status === 'overdue').length;
    const totalOpen = actionItems.filter(a => a.status !== 'completed' && a.status !== 'complete').length;
    const staleCount = leaders.filter(l => l.id !== 'leader-24' && daysSinceUpdate(l.lastUpdated) > 14).length;
    const uncoordinated = intersections.filter(i => i.status === 'identified').length;
    const pendingMeetings = meetings.filter(m => m.status === 'pending_review').length;

    return [
      { to: '/', label: 'Dashboard', icon: ICONS.dashboard },
      { to: '/leaders', label: 'All Leaders', icon: ICONS.leaders, sub: `${staleCount} stale updates` },
      { to: '/strategy-map', label: 'Strategy Map', icon: ICONS.strategyMap, sub: `${intersections.length} total · ${uncoordinated} uncoordinated` },
      { to: '/action-items', label: 'Action Items', icon: ICONS.actionItems, sub: `${totalOpen} open · ${totalOverdue} overdue` },
      { to: '/cadences', label: 'Cadences', icon: ICONS.cadences, sub: `${pendingMeetings} pending review` },
      { to: '/content', label: 'Content Hub', icon: ICONS.content },
    ];
  }

  if (role === 'Strategy') {
    const atRiskKRs = keyResults.filter(k => k.status === 'at_risk' || k.status === 'behind').length;
    const onTrackKRs = keyResults.filter(k => k.status === 'on_track' || k.status === 'completed').length;
    const uncoordinated = intersections.filter(i => i.status === 'identified').length;
    const coordinating = intersections.filter(i => i.status === 'coordinating').length;
    const pendingMeetings = meetings.filter(m => m.status === 'pending_review').length;

    return [
      { to: '/', label: 'Dashboard', icon: ICONS.dashboard },
      { to: '/leaders', label: 'All Leaders', icon: ICONS.leaders, sub: `${keyResults.length} KRs tracked` },
      { to: '/strategy-map', label: 'Strategy Map', icon: ICONS.strategyMap, sub: `${coordinating} coordinating · ${uncoordinated} need action` },
      { to: '/action-items', label: 'Action Items', icon: ICONS.actionItems, sub: `${atRiskKRs} at risk · ${onTrackKRs} on track` },
      { to: '/cadences', label: 'Cadences', icon: ICONS.cadences, sub: `${pendingMeetings} pending review` },
      { to: '/content', label: 'Content Hub', icon: ICONS.content },
    ];
  }

  // Executive (Carolee)
  const staleCount = leaders.filter(l => l.id !== 'leader-24' && daysSinceUpdate(l.lastUpdated) > 14).length;
  const atRiskKRs = keyResults.filter(k => k.status === 'at_risk' || k.status === 'behind').length;
  const uncoordinated = intersections.filter(i => i.status === 'identified').length;
  const totalOverdue = actionItems.filter(a => a.status === 'overdue').length;
  const totalActions = actionItems.filter(a => a.status !== 'completed' && a.status !== 'complete').length;
  const pendingMeetings = meetings.filter(m => m.status === 'pending_review').length;
  const activeLeaders = leaders.filter(l => l.id !== 'leader-24').length;

  return [
    { to: '/', label: 'Dashboard', icon: ICONS.dashboard },
    { to: '/leaders', label: 'All Leaders', icon: ICONS.leaders, sub: `${activeLeaders} leaders · ${staleCount} stale` },
    { to: '/strategy-map', label: 'Strategy Map', icon: ICONS.strategyMap, sub: `${intersections.length} intersections · ${uncoordinated} uncoordinated` },
    { to: '/action-items', label: 'Action Items', icon: ICONS.actionItems, sub: `${totalActions} active · ${totalOverdue} overdue · ${atRiskKRs} KRs at risk` },
    { to: '/cadences', label: 'Cadences', icon: ICONS.cadences, sub: `${pendingMeetings} pending review` },
    { to: '/content', label: 'Content Hub', icon: ICONS.content },
  ];
}

export default function Sidebar({ persona, personas, onPersonaChange, currentPath }) {
  const navItems = getNavItems(persona);
  const roleStyle = ROLE_STYLES[persona.role] || ROLE_STYLES.Leader;
  const isDeputy = persona.role === 'Deputy';
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <aside className="w-64 bg-sidebar text-white flex flex-col shrink-0 h-screen">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-xs font-semibold tracking-widest text-white/50 uppercase">Talent RP</div>
        <div className="text-lg font-bold mt-0.5">Strategy Tracker</div>
      </div>

      {/* Global Search */}
      <form onSubmit={handleSearch} className="px-3 pt-4 pb-1">
        <div className="text-[9px] uppercase tracking-wider text-white/30 font-semibold mb-1.5 px-1">Search Dashboard</div>
        <div className="relative">
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Meetings, actions, leaders..."
            className="w-full bg-white/10 text-white text-sm rounded-lg pl-9 pr-3 py-2.5 border border-white/15 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white/15 transition-all" />
        </div>
      </form>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.to === '/' ? currentPath === '/' : currentPath.startsWith(item.to) && item.to !== '/';
          return (
            <Link key={item.to} to={item.to}
              className={`block px-3 py-2 rounded-lg transition-colors ${active ? 'bg-accent text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="flex-1 text-sm font-medium">{item.label}</span>
              </div>
              {item.sub && (
                <div className={`ml-8 mt-0.5 text-[10px] leading-tight ${active ? 'text-white/60' : 'text-white/30'}`}>{item.sub}</div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-3 flex items-center gap-3">
        <NotificationBell persona={persona} />
        <span className="text-xs text-white/40">Alerts</span>
      </div>

      <div className={`border-t ${isDeputy ? 'border-amber-500/30 bg-amber-950/20' : 'border-white/10'} px-4 py-4`}>
        {isDeputy && (
          <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold mb-2 flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            Deputy Mode
          </div>
        )}
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-semibold">Viewing as</div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className={`w-9 h-9 rounded-full ${roleStyle.bg} ring-2 ${roleStyle.ring} flex items-center justify-center text-xs font-bold shrink-0`}>
            {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium leading-tight truncate">{persona.name.split('(')[0].trim()}</div>
            <div className={`text-[11px] ${roleStyle.label} font-medium`}>{persona.label}</div>
          </div>
        </div>
        <select value={persona.id} onChange={(e) => { const p = personas.find(x => x.id === e.target.value); if (p) onPersonaChange(p); }}
          className="w-full bg-white/10 text-white text-xs rounded-md px-2 py-1.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-accent">
          {personas.map(p => <option key={p.id} value={p.id} className="bg-sidebar">{p.label}</option>)}
        </select>
      </div>
    </aside>
  );
}
