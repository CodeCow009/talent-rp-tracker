import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import ProgressBar from '../components/ProgressBar';
import {
  getLeader, getFinancials, getLeaderCampaigns, getLeaderKeyResults,
  getLeaderNarratives, getLeaderActionItems, getLeaderIntersections,
  masterObjectives, daysSinceUpdate, fmt,
} from '../data';

const STATUS_MAP = { active: 'on_track', at_risk: 'at_risk', behind: 'behind', completed: 'completed' };
const TOPICS = ['Client Developments', 'Strategic Progress', 'Risks & Blockers', 'Team & Capability', 'Cross-Team Needs', 'General Update'];
const SENTIMENTS = [
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'cautious', label: 'Cautious' },
  { value: 'escalation', label: 'Escalation' },
];

export default function LeaderPage({ persona }) {
  const { leaderId } = useParams();
  const leader = getLeader(leaderId);
  const fin = getFinancials(leaderId);
  const camp = getLeaderCampaigns(leaderId);
  const krs = getLeaderKeyResults(leaderId);
  const baseNarratives = getLeaderNarratives(leaderId);
  const actions = getLeaderActionItems(leaderId);
  const connections = getLeaderIntersections(leaderId);

  // Local state for submitted narratives
  const [localNarratives, setLocalNarratives] = useState([]);

  // Narrative form state
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [sentiment, setSentiment] = useState('neutral');
  const [linkedCampaigns, setLinkedCampaigns] = useState([]);
  const [linkedActions, setLinkedActions] = useState([]);
  const [linkedObjectives, setLinkedObjectives] = useState([]);
  const [showLinker, setShowLinker] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!leader) return <div className="p-6 text-gray-500">Leader not found.</div>;

  const days = daysSinceUpdate(leader.lastUpdated);
  const allNarratives = [...localNarratives, ...baseNarratives];
  const overdue = actions.filter(a => a.status === 'overdue');
  const inProgress = actions.filter(a => a.status === 'in_progress');
  const open = actions.filter(a => a.status === 'open');
  const completed = actions.filter(a => a.status === 'completed');

  const isDeputy = persona?.role === 'Deputy';
  const authorName = isDeputy ? persona.name.split('(')[0].trim() : leader.name;

  const handleSubmit = () => {
    if (!topic || !content.trim()) return;

    const newNarrative = {
      id: `local-${Date.now()}`,
      leaderId,
      author: authorName,
      authorType: isDeputy ? 'Deputy' : 'Leader',
      date: '2026-03-24',
      topic,
      content: content.trim(),
      sentiment,
      tags: [],
      linkedObjective: linkedObjectives[0] || null,
      linkedCampaignIds: linkedCampaigns,
      linkedActionIds: linkedActions,
      linkedObjectiveIds: linkedObjectives,
    };

    setLocalNarratives(prev => [newNarrative, ...prev]);
    setTopic('');
    setContent('');
    setSentiment('neutral');
    setLinkedCampaigns([]);
    setLinkedActions([]);
    setLinkedObjectives([]);
    setShowLinker(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const toggleLinked = (list, setList, id) => {
    setList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Helpers to resolve linked items on a narrative
  const getLinkedCampaignNames = (n) => (n.linkedCampaignIds || []).map(id => camp.find(c => c.id === id)?.name).filter(Boolean);
  const getLinkedActionDescs = (n) => (n.linkedActionIds || []).map(id => actions.find(a => a.id === id)?.description).filter(Boolean);
  const getLinkedObjNames = (n) => (n.linkedObjectiveIds || []).map(id => {
    const kr = krs.find(k => k.id === id);
    return kr?.description;
  }).filter(Boolean);

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

        {/* Q4: Narrative & Commentary — FUNCTIONAL */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Narrative & Commentary</h2>

          {/* Input Form */}
          <div className="border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50/50">
            {/* Topic + Sentiment row */}
            <div className="flex items-center gap-2 mb-2">
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className={`text-xs border rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-accent flex-1 ${!topic ? 'border-red-200 text-gray-400' : 'border-gray-200 text-gray-700'}`}
              >
                <option value="">Select topic...</option>
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={sentiment}
                onChange={e => setSentiment(e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none"
              >
                {SENTIMENTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Text area */}
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className={`w-full text-sm border rounded-lg p-2.5 h-20 resize-none focus:outline-none focus:ring-1 focus:ring-accent bg-white ${!content.trim() && topic ? 'border-red-200' : 'border-gray-200'}`}
              placeholder="Share progress updates, client developments, risks, or pain points..."
            />

            {/* Link to items toggle */}
            <button
              onClick={() => setShowLinker(!showLinker)}
              className="text-[11px] text-accent hover:underline mt-1 mb-1 font-medium"
            >
              {showLinker ? 'Hide linked items' : 'Link to campaigns, actions, or objectives...'}
            </button>

            {/* Linker panel */}
            {showLinker && (
              <div className="border border-gray-200 rounded-lg p-3 mt-1 bg-white space-y-3 max-h-[240px] overflow-y-auto">
                {/* Link campaigns */}
                {camp.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Campaigns & Initiatives</div>
                    {camp.map(c => (
                      <label key={c.id} className="flex items-start gap-2 py-1 cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded">
                        <input
                          type="checkbox"
                          checked={linkedCampaigns.includes(c.id)}
                          onChange={() => toggleLinked(linkedCampaigns, setLinkedCampaigns, c.id)}
                          className="rounded mt-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-700 line-clamp-1">{c.name}</div>
                          <div className="text-[10px] text-gray-400">{c.type} &middot; {c.progress}%</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Link action items */}
                {actions.filter(a => a.status !== 'completed').length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Action Items</div>
                    {actions.filter(a => a.status !== 'completed').map(a => (
                      <label key={a.id} className="flex items-start gap-2 py-1 cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded">
                        <input
                          type="checkbox"
                          checked={linkedActions.includes(a.id)}
                          onChange={() => toggleLinked(linkedActions, setLinkedActions, a.id)}
                          className="rounded mt-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-700 line-clamp-1">{a.description}</div>
                          <div className="text-[10px] text-gray-400">
                            <StatusChip status={a.status} /> &middot; Due: {a.dueDate}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Link objectives / key results */}
                {krs.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Strategic Objectives</div>
                    {krs.map(kr => (
                      <label key={kr.id} className="flex items-start gap-2 py-1 cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded">
                        <input
                          type="checkbox"
                          checked={linkedObjectives.includes(kr.id)}
                          onChange={() => toggleLinked(linkedObjectives, setLinkedObjectives, kr.id)}
                          className="rounded mt-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-700 line-clamp-1">{kr.description}</div>
                          <div className="text-[10px] text-gray-400">{kr.progress}% &middot; {kr.status.replace('_', ' ')}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected links summary */}
            {(linkedCampaigns.length + linkedActions.length + linkedObjectives.length > 0) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {linkedCampaigns.map(id => {
                  const c = camp.find(x => x.id === id);
                  return <span key={id} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Campaign: {c?.name?.slice(0, 25)}...</span>;
                })}
                {linkedActions.map(id => {
                  const a = actions.find(x => x.id === id);
                  return <span key={id} className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-medium">Action: {a?.description?.slice(0, 25)}...</span>;
                })}
                {linkedObjectives.map(id => {
                  const kr = krs.find(x => x.id === id);
                  return <span key={id} className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">Objective: {kr?.description?.slice(0, 25)}...</span>;
                })}
              </div>
            )}

            {/* Submit row */}
            <div className="flex items-center justify-between mt-2">
              <div className="text-[10px] text-gray-400">
                Posting as: <span className="font-medium text-gray-600">{authorName}</span>
                {isDeputy && <span className="text-amber-600"> (Deputy)</span>}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!topic || !content.trim()}
                className={`text-xs font-medium px-4 py-1.5 rounded-lg transition-colors ${
                  topic && content.trim()
                    ? 'bg-accent text-white hover:bg-accent/90 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Submit Update
              </button>
            </div>
          </div>

          {/* Success toast */}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3 text-xs text-green-700 font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Update submitted successfully
            </div>
          )}

          {/* Narrative Feed */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {allNarratives.map(n => (
              <div key={n.id} className="border-l-2 border-accent/20 pl-3 py-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    {n.authorType === 'Deputy' ? `${n.author} (Deputy)` : n.author}
                  </span>
                  <StatusChip status={n.sentiment} />
                  <span className="text-[10px] text-gray-400">{n.date}</span>
                </div>
                <div className="text-xs font-medium text-accent/60 mb-0.5">{n.topic}</div>
                <p className="text-xs text-gray-600 leading-relaxed">{n.content}</p>

                {/* Show linked items */}
                {(getLinkedCampaignNames(n).length > 0 || getLinkedActionDescs(n).length > 0 || getLinkedObjNames(n).length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {getLinkedCampaignNames(n).map(name => (
                      <span key={name} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Campaign: {name.slice(0, 30)}{name.length > 30 ? '...' : ''}</span>
                    ))}
                    {getLinkedActionDescs(n).map(desc => (
                      <span key={desc} className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">Action: {desc.slice(0, 30)}{desc.length > 30 ? '...' : ''}</span>
                    ))}
                    {getLinkedObjNames(n).map(name => (
                      <span key={name} className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">Obj: {name.slice(0, 30)}{name.length > 30 ? '...' : ''}</span>
                    ))}
                  </div>
                )}

                {/* Tags from original data */}
                {n.tags?.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {n.tags.map(t => <span key={t} className="text-[10px] bg-gray-50 text-gray-400 px-1 py-0.5 rounded">{t}</span>)}
                  </div>
                )}
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
              const otherId = c.leaderAId === leaderId ? c.leaderBId : c.leaderAId;
              const otherName = c.leaderAId === leaderId ? c.leaderBName : c.leaderAName;
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
                      <Link to={`/leaders/${otherId}`} className="text-sm font-medium text-accent hover:underline">{otherName || other?.name}</Link>
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
