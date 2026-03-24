import { Link } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { to: '/leaders', label: 'All Leaders', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/strategy-map', label: 'Strategy Map', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0h6m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4' },
  { to: '/action-items', label: 'Action Items', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
];

export default function Sidebar({ persona, personas, onPersonaChange, currentPath }) {
  return (
    <aside className="w-60 bg-sidebar text-white flex flex-col shrink-0 h-screen">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-xs font-semibold tracking-widest text-white/50 uppercase">Talent RP</div>
        <div className="text-lg font-bold mt-0.5">Strategy Tracker</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = item.to === '/' ? currentPath === '/' : currentPath.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-accent text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Persona Switcher */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-semibold">Viewing as</div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
            {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="text-sm font-medium leading-tight">{persona.name.split('(')[0].trim()}</div>
            <div className="text-[11px] text-white/50">{persona.label}</div>
          </div>
        </div>
        <select
          value={persona.id}
          onChange={(e) => {
            const p = personas.find(x => x.id === e.target.value);
            if (p) onPersonaChange(p);
          }}
          className="w-full bg-white/10 text-white text-xs rounded-md px-2 py-1.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {personas.map(p => (
            <option key={p.id} value={p.id} className="bg-sidebar">{p.label}</option>
          ))}
        </select>
      </div>
    </aside>
  );
}
