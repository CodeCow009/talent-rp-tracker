import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { leaders, keyResults, actionItems, intersections, daysSinceUpdate } from '../data';
import meetings from '../data/meetings.json';

export default function NotificationBell({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const staleLeaders = leaders.filter(l => l.id !== 'leader-24' && daysSinceUpdate(l.lastUpdated) > 14)
    .sort((a, b) => daysSinceUpdate(b.lastUpdated) - daysSinceUpdate(a.lastUpdated));
  const atRiskKRs = keyResults.filter(k => k.status === 'at_risk' || k.status === 'behind');
  const overdueActions = actionItems.filter(a => a.status === 'overdue');
  const newIntersections = intersections.filter(i => i.status === 'identified');
  const pendingMeetings = meetings.filter(m => m.status === 'pending_review');

  const totalCount = staleLeaders.length + atRiskKRs.length + overdueActions.length + newIntersections.length + pendingMeetings.length;

  const sections = [
    { label: 'Stale Updates', items: staleLeaders.slice(0, 4), color: 'bg-red-500', render: (l) => ({ text: `${l.name} — ${daysSinceUpdate(l.lastUpdated)}d since update`, to: `/leaders/${l.id}` }) },
    { label: 'At Risk Objectives', items: atRiskKRs.slice(0, 4), color: 'bg-amber-500', render: (k) => {
      const leader = leaders.find(l => l.id === k.leaderId);
      return { text: `${k.description.slice(0, 40)}... (${k.progress}%)`, to: `/leaders/${k.leaderId}` };
    }},
    { label: 'Overdue Actions', items: overdueActions.slice(0, 4), color: 'bg-red-500', render: (a) => ({ text: `${a.description.slice(0, 45)}...`, to: `/leaders/${a.leaderId}` }) },
    { label: 'Needs Coordination', items: newIntersections.slice(0, 3), color: 'bg-blue-500', render: (i) => ({ text: `${i.leaderAName} ↔ ${i.leaderBName}`, to: '/strategy-map' }) },
    { label: 'Pending Meetings', items: pendingMeetings.slice(0, 3), color: 'bg-amber-500', render: (m) => ({ text: m.title, to: '/cadences' }) },
  ].filter(s => s.items.length > 0);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-colors">
        <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full ml-2 bottom-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden" style={{ maxHeight: '70vh' }}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-sm font-semibold text-gray-800">Notifications</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{totalCount}</span>
          </div>
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
        </div>
      )}
    </div>
  );
}
