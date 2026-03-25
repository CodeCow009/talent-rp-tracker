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

// Sample transcripts per meeting (keyed by meeting id) — in production these come from the transcription service
const MEETING_TRANSCRIPTS = {
  'meeting-01': `Raj opened with the GenAI playbook update — FSI variant is 70% complete, needs 2 more client validation sessions. Lisa raised pricing concerns on executive coaching retainers — suggests moving to hybrid model. Marcus confirmed SAP bi-directional sync testing is on track for April 8. Priya flagged that methodology v3.0 flexibility boundaries need Carolee's decision — this has been pending 2 weeks. David shared that the Amazon change management toolkit pilot is ready to launch.\n\nAction: Raj to finalize FSI variant with 2 client sessions by March 31.\nAction: Lisa to revise coaching pricing to hybrid model by March 28.\nAction: Marcus to complete SAP sync testing by April 8.\nAction: Priya to escalate methodology decision to Carolee.\nAction: David to launch Amazon toolkit pilot by April 1.`,
  'meeting-02': `Irene discussed Citi CHRO meeting — strong interest in GenAI readiness framework but wants a 4-week pilot before full engagement. Goldman Sachs proposal team needs to be formed this week. BofA discovery workshop deferred to April due to client scheduling conflicts.\n\nAction: Irene to send revised pilot scope to Citi CHRO by Friday.\nAction: Irene to form Goldman Sachs proposal team.\nAction: Sarah Chen to schedule BofA workshop for April.`,
  'meeting-05': `James presented JPMorgan RFP as must-win — team aligned on making it the priority. Diana shared health sector GenAI framework is at 52%, needs Raj's playbook health variant as input. Kevin flagged media GenAI offering needs innovation team support. Maria raised consumer goods client recovery program needs escalation.\n\nAction: James to lead JPMorgan RFP response team.\nAction: Diana to coordinate with Raj on health playbook variant.\nAction: Kevin to request innovation team allocation for media GenAI.\nAction: Maria to escalate consumer goods recovery to Carolee.`,
  'meeting-14': `David and Raj aligned GenAI playbook and change framework timelines. James confirmed he will provide methodology inputs to Irene Bletcher by April 10. Ryan Mitchell allocated a researcher to support Tom Bradley's media offering development.\n\nAction: David to share GenAI change framework draft with Raj by April 5.\nAction: James to deliver methodology inputs to Bletcher by April 10.\nAction: Ryan to confirm researcher assignment to Bradley by March 25.`,
};

// Extracted items per meeting
const MEETING_EXTRACTED = {
  'meeting-01': [
    { description: 'Finalize FSI variant of GenAI playbook with 2 client validation sessions', owner: 'Raj Patel', due: '2026-03-31', topic: 'Offering Development' },
    { description: 'Revise executive coaching retainer pricing to hybrid model', owner: 'Lisa Torres', due: '2026-03-28', topic: 'Pricing' },
    { description: 'Complete SAP bi-directional sync testing', owner: 'Marcus Williams', due: '2026-04-08', topic: 'Technology' },
    { description: 'Escalate methodology v3.0 flexibility decision to Carolee', owner: 'Priya Sharma', due: '2026-03-25', topic: 'Decision Required' },
    { description: 'Launch change management toolkit pilot on Amazon engagement', owner: 'David Chen', due: '2026-04-01', topic: 'Client Delivery' },
  ],
  'meeting-02': [
    { description: 'Send revised GenAI pilot scope to Citi CHRO', owner: 'Irene Bletcher', due: '2026-03-28', topic: 'Client Developments' },
    { description: 'Form Goldman Sachs proposal team', owner: 'Irene Bletcher', due: '2026-03-22', topic: 'Business Development' },
    { description: 'Schedule BofA discovery workshop for April', owner: 'Sarah Chen', due: '2026-04-05', topic: 'Client Developments' },
  ],
  'meeting-05': [
    { description: 'Lead JPMorgan RFP response team — must-win deal', owner: 'James Park', due: '2026-04-01', topic: 'Business Development' },
    { description: 'Coordinate with Raj Patel on health playbook variant input', owner: 'Diana Okonkwo', due: '2026-04-10', topic: 'Cross-Team Needs' },
    { description: 'Request innovation team allocation for media GenAI offering', owner: 'Kevin Walsh', due: '2026-03-28', topic: 'Resource Request' },
    { description: 'Escalate consumer goods client recovery program to Carolee', owner: 'Maria Santos', due: '2026-03-25', topic: 'Escalation' },
  ],
  'meeting-14': [
    { description: 'Share GenAI change framework draft with Raj Patel for alignment', owner: 'David Chen', due: '2026-04-05', topic: 'Cross-Team Needs' },
    { description: 'Deliver methodology inputs to Bletcher by April 10', owner: 'James Park', due: '2026-04-10', topic: 'Deliverable' },
    { description: 'Confirm researcher assignment to Tom Bradley', owner: 'Ryan Mitchell', due: '2026-03-25', topic: 'Resource Request' },
  ],
};

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
  const [confirmed, setConfirmed] = useState({});
  const [expandedMeeting, setExpandedMeeting] = useState(null);
  const [meetingStatusFilter, setMeetingStatusFilter] = useState('all');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [pipelineMeeting, setPipelineMeeting] = useState(null);
  const [meetingTab, setMeetingTab] = useState('intelligence');

  const isLeaderOrDeputy = persona?.role === 'Leader' || persona?.role === 'Deputy';

  const baseMeetings = isLeaderOrDeputy
    ? meetings.filter(m => m.attendees?.includes(persona.leaderId))
    : meetings;

  const sortedMeetings = [...baseMeetings].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalExtracted = baseMeetings.reduce((s, m) => s + (m.extractedActionItems || 0), 0);

  const handleConfirm = (meetingId, idx) => {
    setConfirmed(prev => {
      const list = prev[meetingId] || [];
      return { ...prev, [meetingId]: list.includes(idx) ? list.filter(i => i !== idx) : [...list, idx] };
    });
  };

  const handleConfirmAll = (meetingId, count) => {
    setConfirmed(prev => ({ ...prev, [meetingId]: Array.from({ length: count }, (_, i) => i) }));
  };

  const openPipeline = (meetingId) => {
    setPipelineMeeting(meetingId);
    setMeetingTab('intelligence');
  };

  // Calendar
  const calendarMeetings = baseMeetings.map(m => {
    const shortDay = m.scheduledDay?.split(' ')[0] || '';
    let wdIdx = -1;
    if (shortDay.startsWith('Mon')) wdIdx = 0;
    else if (shortDay.startsWith('Tue')) wdIdx = 1;
    else if (shortDay.startsWith('Wed')) wdIdx = 2;
    else if (shortDay.startsWith('Thu')) wdIdx = 3;
    else if (shortDay.startsWith('Fri')) wdIdx = 4;
    return { ...m, weekDay: wdIdx };
  });

  // Search across all meeting transcripts and key decisions
  const searchResults = transcriptSearch.length >= 2 ? baseMeetings.filter(m => {
    const q = transcriptSearch.toLowerCase();
    const transcript = (MEETING_TRANSCRIPTS[m.id] || '').toLowerCase();
    const decisions = (m.keyDecisions || []).join(' ').toLowerCase();
    const summary = (m.executiveSummary || '').toLowerCase() + (m.operationsSummary || '').toLowerCase() + (m.strategySummary || '').toLowerCase();
    return transcript.includes(q) || decisions.includes(q) || summary.includes(q) || m.title.toLowerCase().includes(q);
  }) : null;

  // Pipeline view for a specific meeting
  const pm = pipelineMeeting ? meetings.find(m => m.id === pipelineMeeting) : null;
  const pmTranscript = pm ? MEETING_TRANSCRIPTS[pm.id] || `[Transcript for "${pm.title}" — ${pm.date}]\n\nKey decisions discussed:\n${(pm.keyDecisions || []).map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\n${pm.extractedActionItems} action items were identified during this meeting.` : '';
  const pmExtracted = pm ? MEETING_EXTRACTED[pm.id] || (pm.keyDecisions || []).map((d, i) => ({ description: d, owner: 'TBD', due: '2026-04-15', topic: 'Decision Follow-up' })) : [];
  const pmConfirmed = confirmed[pipelineMeeting] || [];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{isLeaderOrDeputy ? 'My Cadences' : 'Operating Cadences'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{isLeaderOrDeputy ? `${baseMeetings.length} meetings you attend` : 'Meeting rhythm, notes capture, and action item extraction'}</p>
        </div>
        {pipelineMeeting && (
          <button onClick={() => setPipelineMeeting(null)} className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium">
            &larr; Back to Cadences
          </button>
        )}
      </div>

      {/* Transcript / Notes Search — always visible */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={transcriptSearch} onChange={e => setTranscriptSearch(e.target.value)}
            placeholder="Search meeting transcripts, notes, decisions, and summaries..."
            className="flex-1 text-sm border-0 focus:outline-none focus:ring-0 placeholder-gray-400 text-gray-700" />
          {transcriptSearch && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-accent font-medium">{searchResults?.length || 0} meeting{searchResults?.length !== 1 ? 's' : ''} matched</span>
              <button onClick={() => setTranscriptSearch('')} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
            </div>
          )}
        </div>
        {/* Search results inline */}
        {searchResults && searchResults.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {searchResults.map(m => {
              const attendees = m.attendees.map(id => getLeader(id)).filter(Boolean);
              const transcript = MEETING_TRANSCRIPTS[m.id] || '';
              const q = transcriptSearch.toLowerCase();
              const matchIdx = transcript.toLowerCase().indexOf(q);
              const snippet = matchIdx >= 0
                ? '...' + transcript.slice(Math.max(0, matchIdx - 40), matchIdx) + '**' + transcript.slice(matchIdx, matchIdx + transcriptSearch.length) + '**' + transcript.slice(matchIdx + transcriptSearch.length, matchIdx + transcriptSearch.length + 60) + '...'
                : null;
              return (
                <button key={m.id} onClick={() => openPipeline(m.id)}
                  className="w-full text-left border border-gray-100 rounded-lg p-3 hover:bg-accent/5 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">{m.title}</span>
                    <span className="text-xs text-gray-400">{m.date}</span>
                  </div>
                  {snippet && <div className="text-xs text-gray-500 line-clamp-2">{snippet}</div>}
                  <div className="text-[10px] text-accent font-medium mt-1">Click to view full meeting intelligence &rarr;</div>
                </button>
              );
            })}
          </div>
        )}
        {searchResults && searchResults.length === 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center py-2">No meetings match "{transcriptSearch}"</div>
        )}
      </div>

      {pipelineMeeting && pm ? (
        /* Meeting Intelligence Pipeline — specific to selected meeting */
        <div>
          {/* Meeting header */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{pm.title}</h2>
                <div className="text-xs text-gray-500 mt-0.5">{pm.group} &middot; {pm.cadence} &middot; {pm.date}</div>
              </div>
              <div className="flex items-center gap-2">
                {pm.templateId && (
                  <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                    {MEETING_TEMPLATES?.find(t => t.id === pm.templateId)?.name || pm.templateId}
                  </span>
                )}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pm.status === 'processed' ? 'bg-green-50 text-green-600' : pm.status === 'pending_review' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'}`}>
                  {pm.status === 'processed' ? 'Processed' : pm.status === 'pending_review' ? 'Pending Review' : 'Scheduled'}
                </span>
              </div>
            </div>
            {pm.seriesContext && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2 text-xs text-amber-700">
                <span className="font-semibold">Series Context:</span> {pm.seriesContext}
              </div>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-0.5 w-fit">
            {['intelligence', 'transcript', 'actions'].map(tab => (
              <button key={tab} onClick={() => setMeetingTab(tab)}
                className={`text-xs font-medium px-4 py-2 rounded-md transition-colors capitalize ${meetingTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab === 'intelligence' ? 'Meeting Intelligence' : tab === 'transcript' ? 'Notes & Transcript' : 'Extracted Actions'}
              </button>
            ))}
          </div>

          {meetingTab === 'intelligence' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Role-specific summaries */}
              <div className="space-y-4">
                {pm.executiveSummary && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Meeting Summaries</h3>
                    <div className="space-y-3">
                      <div className="bg-purple-50/50 rounded-lg p-3">
                        <div className="text-[10px] font-bold text-purple-600 uppercase mb-1">Executive View</div>
                        <p className="text-xs text-gray-700 leading-relaxed">{pm.executiveSummary}</p>
                      </div>
                      {pm.operationsSummary && (
                        <div className="bg-blue-50/50 rounded-lg p-3">
                          <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">Operations View</div>
                          <p className="text-xs text-gray-700 leading-relaxed">{pm.operationsSummary}</p>
                        </div>
                      )}
                      {pm.strategySummary && (
                        <div className="bg-emerald-50/50 rounded-lg p-3">
                          <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Strategy View</div>
                          <p className="text-xs text-gray-700 leading-relaxed">{pm.strategySummary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Key Decisions */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Decisions ({pm.keyDecisions?.length || 0})</h3>
                  {(pm.keyDecisions || []).map((d, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2 text-xs text-gray-600">
                      <span className="text-accent font-bold shrink-0 mt-0.5">{i + 1}.</span>{d}
                    </div>
                  ))}
                </div>
              </div>
              {/* Right: topic segments + attendees + patterns */}
              <div className="space-y-4">
                {pm.topicSegments?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Topic Segments</h3>
                    <div className="space-y-2">
                      {pm.topicSegments.map((seg, i) => (
                        <div key={i} className="border border-gray-100 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-800">{seg.topic}</span>
                            <span className="text-[10px] text-gray-400">{seg.startMin}–{seg.endMin} min</span>
                          </div>
                          <p className="text-xs text-gray-500">{seg.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Attendees</h3>
                  <div className="space-y-1.5">
                    {pm.attendees.map(id => getLeader(id)).filter(Boolean).map(a => (
                      <Link key={a.id} to={`/leaders/${a.id}`} className="flex items-center gap-2 text-xs text-accent hover:underline">
                        <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[9px] font-bold">{a.avatar}</div>
                        {a.name}
                        {pm.communicationPatterns?.dominantSpeakers?.includes(a.id) && (
                          <span className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium">Key Speaker</span>
                        )}
                      </Link>
                    ))}
                  </div>
                  {pm.communicationPatterns && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-400">Engagement Score</span>
                        <span className="font-semibold text-gray-600">{Math.round((pm.communicationPatterns.engagementScore || 0) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${(pm.communicationPatterns.engagementScore || 0) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {meetingTab === 'transcript' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Your Notes</h3>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Manual observations</span>
                </div>
                <textarea placeholder="Add your personal notes for this meeting..."
                  className="w-full text-sm border border-gray-200 rounded-lg p-3 h-[300px] resize-none focus:outline-none focus:ring-1 focus:ring-accent bg-blue-50/30 leading-relaxed text-gray-700" />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">AI Transcript</h3>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Copilot / transcription</span>
                </div>
                <div className="text-sm border border-gray-200 rounded-lg p-3 h-[300px] overflow-y-auto bg-gray-50 leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {pmTranscript}
                </div>
              </div>
            </div>
          )}

          {meetingTab === 'actions' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Extracted Action Items</h3>
                <span className="text-xs text-accent font-medium">{pmExtracted.length} items detected</span>
              </div>
              <div className="space-y-2 mb-4">
                {pmExtracted.map((item, idx) => (
                  <div key={idx} className={`border rounded-lg p-3 transition-all ${pmConfirmed.includes(idx) ? 'border-green-200 bg-green-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-start gap-2">
                      <input type="checkbox" checked={pmConfirmed.includes(idx)} onChange={() => handleConfirm(pipelineMeeting, idx)} className="rounded mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">{item.description}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                          <span>Owner: <span className="text-gray-600 font-medium">{item.owner}</span></span>
                          <span>Due: {item.due}</span>
                          <span className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded">{item.topic}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="text-xs text-gray-400">{pmConfirmed.length} of {pmExtracted.length} confirmed</div>
                <button onClick={() => handleConfirmAll(pipelineMeeting, pmExtracted.length)} className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent/90 font-medium">Confirm All</button>
              </div>
              {pmConfirmed.length === pmExtracted.length && pmExtracted.length > 0 && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  All items confirmed — they will flow into each leader's strategy page automatically.
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
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
                        <button key={m.id} onClick={() => openPipeline(m.id)}
                          className={`w-full text-left rounded-lg border p-2 text-[10px] transition-all ${GROUP_COLORS[m.group] || 'bg-gray-50 text-gray-600 border-gray-200'} hover:shadow-sm`}>
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
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">Adherence</span><span className="font-semibold text-gray-600">{h.adherence}%</span></div>
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">Avg Actions</span><span className="font-semibold text-gray-600">{h.avgActions}</span></div>
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">Meetings</span><span className="font-semibold text-gray-600">{h.processed}/{h.total}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary — clickable cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button onClick={() => setMeetingStatusFilter('all')}
              className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${meetingStatusFilter === 'all' ? 'ring-2 ring-accent border-accent' : 'border-gray-200'}`}>
              <div className="text-xs font-semibold text-gray-400 uppercase">Total Meetings</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{baseMeetings.length}</div>
              <div className="text-xs text-gray-500">{isLeaderOrDeputy ? 'you attend' : 'across 5 groups'}</div>
            </button>
            <button onClick={() => setMeetingStatusFilter(meetingStatusFilter === 'processed' ? 'all' : 'processed')}
              className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${meetingStatusFilter === 'processed' ? 'ring-2 ring-accent border-accent' : 'border-gray-200'}`}>
              <div className="text-xs font-semibold text-gray-400 uppercase">Action Items Extracted</div>
              <div className="text-2xl font-bold text-accent mt-1">{totalExtracted}</div>
              <div className="text-xs text-gray-500">click to show processed only</div>
            </button>
            <button onClick={() => setMeetingStatusFilter(meetingStatusFilter === 'pending_review' ? 'all' : 'pending_review')}
              className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${meetingStatusFilter === 'pending_review' ? 'ring-2 ring-amber-400 border-amber-200' : 'border-amber-100'}`}>
              <div className="text-xs font-semibold text-amber-500 uppercase">Pending Review</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{baseMeetings.filter(m => m.status === 'pending_review').length}</div>
              <div className="text-xs text-gray-500">click to show pending only</div>
            </button>
          </div>

          {/* Recent Meetings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">
                {meetingStatusFilter === 'pending_review' ? 'Pending Review' : meetingStatusFilter === 'processed' ? 'Processed Meetings' : 'Recent Meetings'}
              </h2>
              {meetingStatusFilter !== 'all' && (
                <button onClick={() => setMeetingStatusFilter('all')} className="text-xs text-accent hover:underline font-medium">Show all</button>
              )}
            </div>
            <div className="space-y-2">
              {sortedMeetings.filter(m => meetingStatusFilter === 'all' || m.status === meetingStatusFilter).map(m => {
                const attendees = m.attendees.map(id => getLeader(id)).filter(Boolean);
                const statusColor = m.status === 'processed' ? 'bg-green-50 text-green-600' : m.status === 'pending_review' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500';
                const statusLabel = m.status === 'processed' ? 'Processed' : m.status === 'pending_review' ? 'Pending Review' : 'Scheduled';
                return (
                  <div key={m.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-800">{m.title}</div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{statusLabel}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-400">{m.date}</div>
                        <button onClick={() => openPipeline(m.id)} className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent/90 font-medium">
                          View Intelligence
                        </button>
                      </div>
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
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
