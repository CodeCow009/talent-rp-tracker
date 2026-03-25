import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { leaders, financials, narratives, keyResults, actionItems, intersections, meetings, daysSinceUpdate, getLeaderActionItems, getLeaderKeyResults, getLeaderIntersections, getLeader } from '../data';

function buildSections(persona) {
  const role = persona?.role;
  const leaderId = persona?.leaderId;

  if (role === 'Leader' || role === 'Deputy') {
    const leader = getLeader(leaderId);
    const myActions = getLeaderActionItems(leaderId);
    const myKRs = getLeaderKeyResults(leaderId);
    const myConns = getLeaderIntersections(leaderId);
    const myMeetings = meetings.filter(m => m.attendees?.includes(leaderId));

    const overdueActions = myActions.filter(a => a.status === 'overdue');
    const atRiskKRs = myKRs.filter(k => k.status === 'at_risk' || k.status === 'behind');
    const uncoordinated = myConns.filter(c => c.status === 'identified');
    const pendingMeetings = myMeetings.filter(m => m.status === 'pending_review');
    const upcomingDue = myActions.filter(a => {
      if (a.status === 'completed' || a.status === 'complete') return false;
      const days = Math.floor((new Date(a.dueDate) - new Date('2026-03-24')) / 86400000);
      return days >= 0 && days <= 3;
    });

    return [
      { label: 'Overdue Actions', items: overdueActions.slice(0, 5), color: 'bg-red-500',
        render: (a) => ({ text: a.description.length > 50 ? a.description.slice(0, 50) + '...' : a.description, to: '/action-items' }) },
      { label: 'Due Soon (3 days)', items: upcomingDue.slice(0, 4), color: 'bg-amber-500',
        render: (a) => ({ text: `${a.description.slice(0, 40)}... — ${a.dueDate}`, to: '/action-items' }) },
      { label: 'At Risk Objectives', items: atRiskKRs.slice(0, 4), color: 'bg-amber-500',
        render: (k) => ({ text: `${k.description.slice(0, 45)}... (${k.progress}%)`, to: `/leaders/${leaderId}` }) },
      { label: 'Needs Your Coordination', items: uncoordinated.slice(0, 3), color: 'bg-blue-500',
        render: (c) => {
          const otherId = c.leaderAId === leaderId ? c.leaderBId : c.leaderAId;
          const otherName = c.leaderAId === leaderId ? c.leaderBName : c.leaderAName;
          return { text: `Overlap with ${otherName}: ${c.sharedThemes.join(', ')}`, to: '/strategy-map' };
        }},
      { label: 'Pending Meeting Reviews', items: pendingMeetings.slice(0, 3), color: 'bg-gray-500',
        render: (m) => ({ text: m.title, to: '/cadences' }) },
    ].filter(s => s.items.length > 0);
  }

  if (role === 'Operations') {
    const staleLeaders = leaders.filter(l => l.id !== 'leader-24' && daysSinceUpdate(l.lastUpdated) > 14)
      .sort((a, b) => daysSinceUpdate(b.lastUpdated) - daysSinceUpdate(a.lastUpdated));
    const overdueActions = actionItems.filter(a => a.status === 'overdue');
    const escalations = actionItems.filter(a => a.priority === 'high' && a.status === 'overdue');
    const pendingMeetings = meetings.filter(m => m.status === 'pending_review');
    // Financial underperformers
    const underperformers = leaders.filter(l => {
      const f = financials.find(x => x.leaderId === l.id);
      return f && f.revenuePctToTarget < 70 && l.id !== 'leader-24';
    });

    return [
      { label: 'Overdue Actions', items: overdueActions.slice(0, 5), color: 'bg-red-500',
        render: (a) => ({ text: `${a.owner}: ${a.description.slice(0, 40)}...`, to: '/action-items' }) },
      { label: 'Stale Leader Updates', items: staleLeaders.slice(0, 5), color: 'bg-red-500',
        render: (l) => ({ text: `${l.name} — ${daysSinceUpdate(l.lastUpdated)}d since update`, to: `/leaders/${l.id}` }) },
      { label: 'Revenue Behind (<70%)', items: underperformers.slice(0, 4), color: 'bg-amber-500',
        render: (l) => {
          const f = financials.find(x => x.leaderId === l.id);
          return { text: `${l.name} — ${f?.revenuePctToTarget}% to target`, to: `/leaders/${l.id}` };
        }},
      { label: 'Meetings to Review', items: pendingMeetings.slice(0, 3), color: 'bg-amber-500',
        render: (m) => ({ text: m.title, to: '/cadences' }) },
    ].filter(s => s.items.length > 0);
  }

  if (role === 'Strategy') {
    const atRiskKRs = keyResults.filter(k => k.status === 'at_risk' || k.status === 'behind')
      .sort((a, b) => (a.progress || 0) - (b.progress || 0));
    const uncoordinated = intersections.filter(i => i.status === 'identified');
    const staleLeaders = leaders.filter(l => l.id !== 'leader-24' && daysSinceUpdate(l.lastUpdated) > 14)
      .sort((a, b) => daysSinceUpdate(b.lastUpdated) - daysSinceUpdate(a.lastUpdated));
    const pendingMeetings = meetings.filter(m => m.status === 'pending_review');

    return [
      { label: 'At Risk / Behind KRs', items: atRiskKRs.slice(0, 6), color: 'bg-red-500',
        render: (k) => {
          const leader = getLeader(k.leaderId);
          return { text: `${leader?.name?.split(' ').pop()}: ${k.description.slice(0, 35)}... (${k.progress}%)`, to: `/leaders/${k.leaderId}` };
        }},
      { label: 'Uncoordinated Overlaps', items: uncoordinated.slice(0, 4), color: 'bg-amber-500',
        render: (i) => ({ text: `${i.leaderAName} ↔ ${i.leaderBName}: ${i.sharedThemes.slice(0, 2).join(', ')}`, to: '/strategy-map' }) },
      { label: 'Stale Narrative Updates', items: staleLeaders.slice(0, 4), color: 'bg-amber-500',
        render: (l) => ({ text: `${l.name} — ${daysSinceUpdate(l.lastUpdated)}d ago`, to: `/leaders/${l.id}` }) },
      { label: 'Meetings Pending Review', items: pendingMeetings.slice(0, 3), color: 'bg-gray-500',
        render: (m) => ({ text: m.title, to: '/cadences' }) },
    ].filter(s => s.items.length > 0);
  }

  // Executive (Carolee) — high-level org alerts
  const staleLeaders = leaders.filter(l => l.id !== 'leader-24' && daysSinceUpdate(l.lastUpdated) > 14)
    .sort((a, b) => daysSinceUpdate(b.lastUpdated) - daysSinceUpdate(a.lastUpdated));
  const atRiskKRs = keyResults.filter(k => k.status === 'at_risk' || k.status === 'behind')
    .sort((a, b) => (a.progress || 0) - (b.progress || 0));
  const overdueActions = actionItems.filter(a => a.status === 'overdue');
  const uncoordinated = intersections.filter(i => i.status === 'identified');
  const escalationNarratives = narratives.filter(n => n.sentiment === 'escalation');

  return [
    { label: 'Escalations from Leaders', items: escalationNarratives.slice(0, 4), color: 'bg-red-500',
      render: (n) => {
        const leader = getLeader(n.leaderId);
        return { text: `${leader?.name}: ${n.content.slice(0, 45)}...`, to: `/leaders/${n.leaderId}` };
      }},
    { label: 'At Risk Objectives', items: atRiskKRs.slice(0, 4), color: 'bg-red-500',
      render: (k) => {
        const leader = getLeader(k.leaderId);
        return { text: `${leader?.name?.split(' ').pop()}: ${k.description.slice(0, 35)}... (${k.progress}%)`, to: `/leaders/${k.leaderId}` };
      }},
    { label: 'Stale Updates', items: staleLeaders.slice(0, 4), color: 'bg-amber-500',
      render: (l) => ({ text: `${l.name} — ${daysSinceUpdate(l.lastUpdated)}d since update`, to: `/leaders/${l.id}` }) },
    { label: 'Overdue Actions (Org)', items: overdueActions.slice(0, 3), color: 'bg-amber-500',
      render: (a) => ({ text: `${a.owner}: ${a.description.slice(0, 40)}...`, to: '/action-items' }) },
    { label: 'Uncoordinated Strategies', items: uncoordinated.slice(0, 3), color: 'bg-blue-500',
      render: (i) => ({ text: `${i.leaderAName} ↔ ${i.leaderBName}`, to: '/strategy-map' }) },
  ].filter(s => s.items.length > 0);
}

const ROLE_TITLES = {
  Executive: 'Executive Alerts',
  Operations: 'Operations Alerts',
  Strategy: 'Strategy Alerts',
  Leader: 'My Alerts',
  Deputy: 'My Alerts',
};

export default function NotificationBell({ persona }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sections = buildSections(persona);
  const totalCount = sections.reduce((s, sec) => s + sec.items.length, 0);
  const title = ROLE_TITLES[persona?.role] || 'Alerts';

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-colors">
        <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full ml-2 bottom-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden" style={{ maxHeight: '70vh' }}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-sm font-semibold text-gray-800">{title}</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{totalCount}</span>
          </div>
          {sections.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-gray-400">No alerts right now</div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 48px)' }}>
              {sections.map(section => (
                <div key={section.label} className="border-b border-gray-50 last:border-0">
                  <div className="px-4 py-2 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${section.color}`} />
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{section.label}</span>
                    <span className="text-[10px] text-gray-300 ml-auto">{section.items.length}</span>
                  </div>
                  {section.items.map((item, i) => {
                    const { text, to } = section.render(item);
                    return (
                      <Link key={i} to={to} onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors border-l-2 border-transparent hover:border-accent ml-2">
                        {text}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
