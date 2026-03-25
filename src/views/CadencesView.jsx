import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import { getLeader, actionItems, leaders, meetings, MEETING_TEMPLATES } from '../data';

const GROUP_COLORS = {
  Offerings: 'bg-blue-100 text-blue-700 border-blue-200',
  Markets: 'bg-purple-100 text-purple-700 border-purple-200',
  Industries: 'bg-green-100 text-green-700 border-green-200',
  Engines: 'bg-amber-100 text-amber-700 border-amber-200',
  'Growth & Strategy': 'bg-red-100 text-red-700 border-red-200',
};

const SAMPLE_TRANSCRIPT = `Irene mentioned that Citi's CHRO is very interested in the GenAI readiness framework but wants to see a 4-week pilot before committing to a full engagement. She's working with the Americas delivery team on the pilot proposal.

James said the banking methodology v2 needs about two more weeks — the external benchmarking review from Deloitte caused some rework on the frameworks. He flagged that Irene's Citi pilot depends on this methodology being finalized.

Raj gave an update on the consultant certification program — 35 of 50 consultants are now certified on the GenAI toolkit. Client feedback from the Microsoft pilot was overwhelmingly positive.

Sandra raised concerns about fragmented GenAI messaging across 4 different teams and requested an alignment meeting with Raj, James, and Marcus.

Action: Irene to send revised pilot scope to Citi CHRO by Friday.
Action: James to finalize GenAI methodology v2 by April 15.
Action: Sandra to organize cross-team GenAI messaging alignment meeting.
Action: Raj to complete remaining 15 consultant certifications by April 15.`;

const EXTRACTED_ITEMS = [
  { description: 'Send revised GenAI pilot scope to Citi CHRO', owner: 'Irene Bletcher', due: '2026-03-28', topic: 'Client Developments', status: 'extracted' },
  { description: 'Finalize GenAI methodology v2 document', owner: 'James Park', due: '2026-04-15', topic: 'Offering Development', status: 'extracted' },
  { description: 'Organize cross-team GenAI messaging alignment meeting', owner: 'Sandra Obi', due: '2026-04-05', topic: 'Cross-Team Needs', status: 'extracted' },
  { description: 'Complete GenAI toolkit certification for remaining 15 consultants', owner: 'Raj Patel', due: '2026-04-15', topic: 'Team & Capability', status: 'extracted' },
  { description: 'Follow up with Citi CHRO on pilot timeline expectations', owner: 'Sarah Chen (Deputy)', due: '2026-04-01', topic: 'Client Developments', status: 'extracted' },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function getCadenceHealth(group) {
  const groupMeetings = meetings.filter(m => m.group === group);
  const processed = groupMeetings.filter(m => m.status === 'processed').length;
  const total = groupMeetings.length;
  const adherence = total > 0 ? Math.round((processed / total) * 100) : 0;
  const avgActions = total > 0 ? (groupMeetings.reduce((s, m) => s + (m.extractedActionItems || 0), 0) / total).toFixed(1) : 0;
  const health = adherence >= 80 ? 'green' : adherence >= 60 ? 'watch' : 'risk';
  return { adherence, avgActions, health, total, processed };
}

export default function CadencesView({ persona }) {
  const [showPipeline, setShowPipeline] = useState(false);
  const [confirmed, setConfirmed] = useState([]);
  const [pipelineText, setPipelineText] = useState(SAMPLE_TRANSCRIPT);
  const [expandedMeeting, setExpandedMeeting] = useState(null);

  const isLeaderOrDeputy = persona?.role === 'Leader' || persona?.role === 'Deputy';

  const baseMeetings = isLeaderOrDeputy
    ? meetings.filter(m => m.attendees?.includes(persona.leaderId))
    : meetings;

  const handleConfirm = (idx) => {
    setConfirmed(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const handleConfirmAll = () => {
    setConfirmed(EXTRACTED_ITEMS.map((_, i) => i));
  };

  const sortedMeetings = [...baseMeetings].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalExtracted = baseMeetings.reduce((s, m) => s + (m.extractedActionItems || 0), 0);

  // Calendar data — map meetings to weekday slots
  const calendarMeetings = baseMeetings.map(m => {
    const dayIdx = WEEK_DAYS.indexOf(m.scheduledDay?.split(' ')[0]?.slice(0, 3) || '') ;
    const shortDay = m.scheduledDay?.split(' ')[0] || '';
    let wdIdx = -1;
    if (shortDay.startsWith('Mon')) wdIdx = 0;
    else if (shortDay.startsWith('Tue')) wdIdx = 1;
    else if (shortDay.startsWith('Wed')) wdIdx = 2;
    else if (shortDay.startsWith('Thu')) wdIdx = 3;
    else if (shortDay.startsWith('Fri')) wdIdx = 4;
    return { ...m, weekDay: wdIdx };
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{isLeaderOrDeputy ? 'My Cadences' : 'Operating Cadences'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{isLeaderOrDeputy ? `${baseMeetings.length} meetings you attend` : 'Meeting rhythm, notes capture, and action item extraction'}</p>
        </div>
        <button onClick={() => setShowPipeline(!showPipeline)} className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 font-medium">
          {showPipeline ? 'Back to Cadences' : 'Demo: Meeting → Action Pipeline'}
        </button>
      </div>

      {!showPipeline ? (
        <>
          {/* Weekly Calendar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Cadence Calendar</h2>
            <div className="grid grid-cols-5 gap-3">
              {WEEK_DAYS.map((day, di) => {
                const dayMeetings = calendarMeetings.filter(m => m.weekDay === di);
                return (
                  <div key={day} className="min-h-[120px]">
                    <div className="text-xs font-semibold text-gray-500 text-center mb-2 pb-1 border-b border-gray-100">{day}</div>
                    <div className="space-y-1.5">
                      {dayMeetings.map(m => (
                        <button key={m.id} onClick={() => setExpandedMeeting(expandedMeeting === m.id ? null : m.id)}
                          className={`w-full text-left rounded-lg border p-2 text-[10px] transition-all ${GROUP_COLORS[m.group] || 'bg-gray-50 text-gray-600 border-gray-200'} ${expandedMeeting === m.id ? 'ring-2 ring-accent' : 'hover:shadow-sm'}`}>
                          <div className="font-semibold line-clamp-1">{m.title.replace(/Cadence|Weekly|Bi-weekly/gi, '').trim()}</div>
                          <div className="opacity-70 mt-0.5">{m.scheduledDay?.split(' ').slice(1).join(' ')}</div>
                        </button>
                      ))}
                      {dayMeetings.length === 0 && <div className="text-[10px] text-gray-300 text-center py-4">No meetings</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meeting Detail (when expanded) */}
          {expandedMeeting && (() => {
            const m = meetings.find(x => x.id === expandedMeeting);
            if (!m) return null;
            const attendees = m.attendees.map(id => getLeader(id)).filter(Boolean);
            return (
              <div className="bg-white rounded-xl border border-accent/20 p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">{m.title}</h3>
                    <div className="text-xs text-gray-500 mt-0.5">{m.group} &middot; {m.cadence} &middot; {m.scheduledDay}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.status === 'processed' ? 'bg-green-50 text-green-600' : m.status === 'pending_review' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'}`}>
                      {m.status === 'processed' ? 'Processed' : m.status === 'pending_review' ? 'Pending Review' : 'Scheduled'}
                    </span>
                    <button onClick={() => setExpandedMeeting(null)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
                  </div>
                </div>
                {/* Role-specific summary */}
                {m.executiveSummary && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-3">
                    <div className="flex gap-2 mb-2">
                      {[
                        { key: 'exec', label: 'Executive', show: persona?.role === 'Executive' || !persona },
                        { key: 'ops', label: 'Operations', show: persona?.role === 'Operations' },
                        { key: 'strategy', label: 'Strategy', show: persona?.role === 'Strategy' },
                      ].map(v => v.show && (
                        <span key={v.key} className="text-[9px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">{v.label} Summary</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {persona?.role === 'Operations' ? m.operationsSummary : persona?.role === 'Strategy' ? m.strategySummary : m.executiveSummary}
                    </p>
                  </div>
                )}

                {/* Topic Segments */}
                {m.topicSegments?.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Topic Segments</div>
                    <div className="flex gap-2 flex-wrap">
                      {m.topicSegments.map((seg, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-lg px-2.5 py-1.5 text-[10px]">
                          <span className="text-gray-400 mr-1">{seg.startMin}-{seg.endMin}m</span>
                          <span className="font-medium text-gray-700">{seg.topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Attendees ({attendees.length})</div>
                    <div className="space-y-1">
                      {attendees.map(a => (
                        <Link key={a.id} to={`/leaders/${a.id}`} className="flex items-center gap-2 text-xs text-accent hover:underline">
                          <div className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[8px] font-bold">{a.avatar}</div>
                          {a.name}
                        </Link>
                      ))}
                    </div>
                    {/* Communication Patterns */}
                    {m.communicationPatterns && (
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Engagement</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${(m.communicationPatterns.engagementScore || 0) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-500">{Math.round((m.communicationPatterns.engagementScore || 0) * 100)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Key Decisions</div>
                    {m.keyDecisions?.length > 0 ? m.keyDecisions.map((d, i) => (
                      <div key={i} className="text-xs text-gray-600 flex items-start gap-1.5 mb-1">
                        <span className="text-accent shrink-0 mt-0.5">&#8226;</span>{d}
                      </div>
                    )) : <div className="text-xs text-gray-400">No decisions recorded</div>}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Extracted Items</div>
                    <div className="text-2xl font-bold text-accent">{m.extractedActionItems}</div>
                    <div className="text-xs text-gray-500">action items extracted</div>
                    {m.templateId && (
                      <div className="mt-2 text-[10px] text-gray-400">
                        Template: <span className="font-medium text-gray-600">{MEETING_TEMPLATES?.find(t => t.id === m.templateId)?.name || m.templateId}</span>
                      </div>
                    )}
                    {m.seriesContext && (
                      <div className="mt-1 text-[10px] text-gray-400 bg-accent/5 rounded px-2 py-1">{m.seriesContext}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Cadence Health Cards */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Cadence Health by Group</h2>
            <div className="grid grid-cols-5 gap-3">
              {['Offerings', 'Markets', 'Industries', 'Engines', 'Growth & Strategy'].map(group => {
                const h = getCadenceHealth(group);
                const healthDot = h.health === 'green' ? 'bg-green-500' : h.health === 'watch' ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={group} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${healthDot}`} />
                      <div className="text-xs font-semibold text-gray-700">{group}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-400">Adherence</span>
                        <span className="font-semibold text-gray-600">{h.adherence}%</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-400">Avg Actions/Meeting</span>
                        <span className="font-semibold text-gray-600">{h.avgActions}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-400">Meetings</span>
                        <span className="font-semibold text-gray-600">{h.processed}/{h.total}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase">Total Meetings</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{baseMeetings.length}</div>
              <div className="text-xs text-gray-500">{isLeaderOrDeputy ? 'you attend' : 'across 5 groups'}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase">Action Items Extracted</div>
              <div className="text-2xl font-bold text-accent mt-1">{totalExtracted}</div>
              <div className="text-xs text-gray-500">from meeting notes via AI</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase">Pending Review</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{baseMeetings.filter(m => m.status === 'pending_review').length}</div>
              <div className="text-xs text-gray-500">meetings with unconfirmed items</div>
            </div>
          </div>

          {/* Recent Meetings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Meetings</h2>
            <div className="space-y-2">
              {sortedMeetings.map(m => {
                const attendees = m.attendees.map(id => getLeader(id)).filter(Boolean);
                const statusColor = m.status === 'processed' ? 'bg-green-50 text-green-600' : m.status === 'pending_review' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500';
                const statusLabel = m.status === 'processed' ? 'Processed' : m.status === 'pending_review' ? 'Pending Review' : 'Scheduled';
                return (
                  <button key={m.id} onClick={() => setExpandedMeeting(expandedMeeting === m.id ? null : m.id)}
                    className={`w-full text-left border border-gray-100 rounded-lg p-4 hover:bg-gray-50/50 transition-all ${expandedMeeting === m.id ? 'ring-2 ring-accent' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-800">{m.title}</div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{statusLabel}</span>
                      </div>
                      <div className="text-xs text-gray-400">{m.date}</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{m.group} &middot; {m.cadence}</span>
                      <span>{m.extractedActionItems} action items</span>
                      <span>{attendees.map(a => a.name.split(' ').pop()).join(', ')}{attendees.length > 3 ? ` +${attendees.length - 3}` : ''}</span>
                    </div>
                    {m.keyDecisions && m.keyDecisions.length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {m.keyDecisions.slice(0, 2).map((d, i) => (
                          <div key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                            <span className="text-accent shrink-0 mt-0.5">&#8226;</span><span>{d}</span>
                          </div>
                        ))}
                        {m.keyDecisions.length > 2 && <div className="text-[10px] text-gray-400">+{m.keyDecisions.length - 2} more decisions</div>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Meeting → Action Item Pipeline Demo */
        <div>
          <div className="bg-accent/5 border border-accent/10 rounded-lg p-3 mb-4 text-xs text-accent">
            This demo shows how meeting notes + AI transcript are merged and intelligently extracted into structured action items — reducing manual work for leaders.
          </div>

          {/* Template selector + context */}
          <div className="flex items-center gap-4 mb-4">
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Meeting Template</label>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                {(MEETING_TEMPLATES || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex-1 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <div className="text-[10px] font-semibold text-amber-600 uppercase">Series Context (Auto-Injected)</div>
              <div className="text-xs text-amber-700 mt-0.5">Previous meeting (Mar 20): 8 action items extracted, 3 still open. Open items: "Finalize FSI playbook variant", "Complete SAP integration testing", "Accelerate GenAI methodology v2"</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left: Dual Input */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-700">Your Notes</h2>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Manual observations</span>
                </div>
                <textarea
                  placeholder="Type your observations, key takeaways, and things the transcript might miss..."
                  className="w-full text-sm border border-gray-200 rounded-lg p-3 h-[160px] resize-none focus:outline-none focus:ring-1 focus:ring-accent bg-blue-50/30 leading-relaxed text-gray-700"
                  defaultValue="Client seemed hesitant on timeline — Irene thinks we need to reduce pilot scope. James was frustrated about methodology delays. Raj's team morale is high after Microsoft feedback. Sandra's messaging concern is bigger than she let on — I think this needs exec attention."
                />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-700">AI Transcript</h2>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Copilot / transcription</span>
                </div>
                <textarea value={pipelineText} onChange={e => setPipelineText(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg p-3 h-[240px] resize-none focus:outline-none focus:ring-1 focus:ring-accent bg-gray-50 leading-relaxed text-gray-700" />
              </div>
            </div>

            {/* Right: Enhanced extraction */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">AI-Extracted Intelligence</h2>
                <span className="text-xs text-accent font-medium">{EXTRACTED_ITEMS.length} items + 3 insights</span>
              </div>

              {/* Meeting intelligence summary */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                <div className="text-[10px] font-semibold text-gray-500 uppercase">Meeting Intelligence</div>
                <div className="text-xs text-gray-700"><span className="font-semibold text-accent">Executive:</span> Key decisions on GenAI methodology acceleration and Citi pilot scope. Cross-team alignment needed on messaging.</div>
                <div className="text-xs text-gray-700"><span className="font-semibold text-blue-600">Operations:</span> GenAI methodology v2 delayed 2 weeks, impacting Citi pilot and Goldman proposal timelines. 35/50 consultants certified.</div>
                <div className="text-xs text-gray-700"><span className="font-semibold text-emerald-600">Strategy:</span> 4 teams have fragmented GenAI messaging — alignment meeting needed. Citi pilot depends on methodology v2 completion.</div>
              </div>

              {/* Recurring blocker detection */}
              <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 mb-4">
                <div className="text-[10px] font-semibold text-red-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>
                  Recurring Blocker Detected
                </div>
                <div className="text-xs text-red-700 mt-0.5">"GenAI methodology v2" has appeared as a blocker in 3 consecutive meetings. Escalating to recurring blocker status.</div>
              </div>

              {/* Action items */}
              <div className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Extracted Action Items</div>
              <div className="space-y-2 mb-4 max-h-[240px] overflow-y-auto pr-1">
                {EXTRACTED_ITEMS.map((item, idx) => (
                  <div key={idx} className={`border rounded-lg p-3 transition-all ${confirmed.includes(idx) ? 'border-green-200 bg-green-50/50' : 'border-gray-100'}`}>
                    <div className="flex items-start gap-2">
                      <input type="checkbox" checked={confirmed.includes(idx)} onChange={() => handleConfirm(idx)} className="rounded mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">{item.description}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                          <span>Owner: <span className="text-gray-600 font-medium">{item.owner}</span></span>
                          <span>Due: {item.due}</span>
                          <span className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded">{item.topic}</span>
                          <button className="text-[10px] text-accent hover:underline">Jump to source</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="text-xs text-gray-400">{confirmed.length} of {EXTRACTED_ITEMS.length} confirmed</div>
                <button onClick={handleConfirmAll} className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent/90 font-medium">Confirm All</button>
              </div>
              {confirmed.length === EXTRACTED_ITEMS.length && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  All items confirmed — they will flow into each leader's strategy page automatically.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
