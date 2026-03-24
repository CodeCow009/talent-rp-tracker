import { useParams, Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import ProgressBar from '../components/ProgressBar';
import {
  getLeader, getFinancials, getLeaderCampaigns, getLeaderKeyResults,
  getLeaderNarratives, getLeaderActionItems, getLeaderIntersections,
  masterObjectives, leaders, daysSinceUpdate, fmt,
} from '../data';

const STATUS_MAP = { active: 'on_track', at_risk: 'at_risk', behind: 'behind', completed: 'completed' };

export default function LeaderPage({ persona }) {
  const { leaderId } = useParams();
  const leader = getLeader(leaderId);
  const fin = getFinancials(leaderId);
  const camp = getLeaderCampaigns(leaderId);
  const krs = getLeaderKeyResults(leaderId);
  const narr = getLeaderNarratives(leaderId);
  const actions = getLeaderActionItems(leaderId);
  const connections = getLeaderIntersections(leaderId);

  if (!leader) return <div className="p-6 text-gray-500">Leader not found.</div>;

  const days = daysSinceUpdate(leader.lastUpdated);
  const overdue = actions.filter(a => a.status === 'overdue');
  const inProgress = actions.filter(a => a.status === 'in_progress');
  const open = actions.filter(a => a.status === 'open');
  const completed = actions.filter(a => a.status === 'completed');

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-400 mb-4">
        <Link to="/" className="hover:text-accent">Dashboard</Link> &rarr;{' '}
        <Link to="/leaders" className="hover:text-accent">Leaders</Link> &rarr;{' '}
        <span className="text-gray-600">{leader.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xl font-bold shrink-0">
          {leader.avatar}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-gray-900">{leader.name}</h1>
          <div className="text-sm text-gray-500">{leader.title} &middot; {leader.group}</div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <StatusChip status={leader.overallHealth} />
            <span className="text-xs text-gray-400">Deputy: {leader.deputyName}</span>
            <span className="text-xs text-gray-400">Updated {days === 0 ? 'today' : `${days}d ago`}</span>
            <span className="text-xs text-gray-400">{leader.directReports} direct reports</span>
          </div>
        </div>
      </div>

      {/* Four Quadrants */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Q1: Financials */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Structured Metrics</h2>
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Fed by Ops Team</span>
          </div>
          {fin ? (
            <div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Revenue</span>
                  <span>{fmt(fin.revenueActual)} / {fmt(fin.revenueTarget)}</span>
                </div>
                <ProgressBar value={fin.revenuePctToTarget} size="lg" />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4">
                <div><div className="text-xs text-gray-400">Pipeline</div><div className="text-lg font-semibold text-gray-800">{fmt(fin.pipelineValue)}</div><div className="text-xs text-gray-400">{fin.pipelineCoverage}x coverage</div></div>
                <div><div className="text-xs text-gray-400">Win Rate</div><div className="text-lg font-semibold text-gray-800">{fin.winRate}%</div><div className="text-xs text-gray-400">{fin.wins} wins</div></div>
                <div><div className="text-xs text-gray-400">Chargeability</div><div className="text-lg font-semibold text-gray-800">{fin.chargeability}%</div></div>
                <div><div className="text-xs text-gray-400">Profitability</div><div className="text-lg font-semibold text-gray-800">{fin.profitabilityMargin}%</div></div>
                <div><div className="text-xs text-gray-400">Headcount</div><div className="text-lg font-semibold text-gray-800">{fin.headcount}</div></div>
                <div><div className="text-xs text-gray-400">Open Roles</div><div className="text-lg font-semibold text-gray-800">{fin.openRoles}</div></div>
              </div>
            </div>
          ) : <p className="text-sm text-gray-400">No financial data.</p>}
        </div>

        {/* Q2: Campaigns */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Campaigns & Initiatives</h2>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {camp.length ? camp.map(c => (
              <div key={c.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 line-clamp-1">{c.name}</span>
                  <StatusChip status={STATUS_MAP[c.status] || c.status} />
                </div>
                <ProgressBar value={c.progress} size="sm" />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-gray-400">{c.type}</span>
                  <span className="text-[10px] text-gray-400">Target: {c.targetDate}</span>
                </div>
                {c.nextMilestone && <div className="text-xs text-accent mt-1 line-clamp-1">Next: {c.nextMilestone}</div>}
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {(c.tags || []).slice(0, 4).map(t => (
                    <span key={t} className="text-[10px] bg-gray-50 text-gray-400 px-1 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
            )) : <p className="text-sm text-gray-400">No campaigns.</p>}
          </div>
        </div>

        {/* Q3: Strategic Objectives */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Strategic Objectives</h2>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {krs.length ? krs.map(kr => {
              const parent = masterObjectives.find(o => o.id === kr.masterObjectiveId);
              return (
                <div key={kr.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="text-[10px] text-accent/60 font-medium mb-1 line-clamp-1">{parent?.title}</div>
                  <div className="text-sm font-medium text-gray-800 mb-1">{kr.description}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusChip status={kr.status} />
                    <span className="text-[10px] text-gray-400">Due: {kr.targetDate}</span>
                  </div>
                  <ProgressBar value={kr.progress} size="sm" />
                </div>
              );
            }) : <p className="text-sm text-gray-400">No key results mapped.</p>}
          </div>
        </div>

        {/* Q4: Narrative */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Narrative & Commentary</h2>

          {/* Input */}
          <div className="border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-2">
              <select className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none">
                <option>Select topic...</option>
                <option>Client Developments</option>
                <option>Strategic Progress</option>
                <option>Risks & Blockers</option>
                <option>Team & Capability</option>
                <option>Cross-Team Needs</option>
                <option>General Update</option>
              </select>
            </div>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-lg p-2 h-16 resize-none focus:outline-none focus:ring-1 focus:ring-accent bg-white"
              placeholder="Type your update..."
            />
            <div className="flex justify-end mt-1">
              <button className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent/90 font-medium">Submit Update</button>
            </div>
          </div>

          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
            {narr.map(n => (
              <div key={n.id} className="border-l-2 border-accent/20 pl-3 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    {n.authorType === 'Deputy' ? `${n.author} (Deputy)` : n.author}
                  </span>
                  <StatusChip status={n.sentiment} />
                  <span className="text-[10px] text-gray-400">{n.date}</span>
                </div>
                <div className="text-xs font-medium text-accent/60 mb-0.5">{n.topic}</div>
                <p className="text-xs text-gray-600 leading-relaxed">{n.content}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {n.tags.map(t => <span key={t} className="text-[10px] bg-gray-50 text-gray-400 px-1 py-0.5 rounded">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Action Items</h2>
        {[
          { items: overdue, label: 'OVERDUE', color: 'text-red-500' },
          { items: inProgress, label: 'IN PROGRESS', color: 'text-blue-500' },
          { items: open, label: 'OPEN', color: 'text-gray-500' },
        ].filter(g => g.items.length > 0).map(g => (
          <div key={g.label} className="mb-3">
            <div className={`text-xs font-semibold ${g.color} mb-1.5`}>{g.label} ({g.items.length})</div>
            {g.items.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-1.5 text-sm">
                <input type="checkbox" className="rounded" readOnly />
                <StatusChip status={a.status} />
                <span className="text-gray-700 flex-1">{a.description}</span>
                <span className="text-xs text-gray-400 shrink-0">Due: {a.dueDate}</span>
              </div>
            ))}
          </div>
        ))}
        {completed.length > 0 && (
          <details className="text-sm text-gray-400">
            <summary className="cursor-pointer text-xs font-semibold mb-1.5">COMPLETED ({completed.length})</summary>
            {completed.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-1.5">
                <input type="checkbox" checked readOnly className="rounded" />
                <span className="line-through">{a.description}</span>
              </div>
            ))}
          </details>
        )}
      </div>

      {/* Connections */}
      {connections.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Strategy Connections</h2>
          <div className="space-y-3">
            {connections.map(c => {
              const otherId = c.leaderA === leaderId ? c.leaderB : c.leaderA;
              const other = getLeader(otherId);
              return (
                <div key={c.id} className="flex items-start gap-3 border border-gray-100 rounded-lg p-3">
                  <Link to={`/leaders/${otherId}`} className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold">
                      {other?.avatar}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/leaders/${otherId}`} className="text-sm font-medium text-accent hover:underline">{other?.name}</Link>
                      <span className="text-[10px] text-gray-400">{other?.group}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{c.description}</p>
                    <div className="flex gap-1 mt-1">
                      {c.sharedThemes.map(t => <span key={t} className="text-[10px] bg-accent/5 text-accent px-1.5 py-0.5 rounded">{t}</span>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Link to="/strategy-map" className="text-sm text-accent font-medium mt-3 inline-block hover:underline">
            View full Strategy Map &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
