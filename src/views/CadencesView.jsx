import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../components/StatusChip';
import { getLeader, actionItems } from '../data';
import meetings from '../data/meetings.json';

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

export default function CadencesView() {
  const [showPipeline, setShowPipeline] = useState(false);
  const [confirmed, setConfirmed] = useState([]);
  const [pipelineText, setPipelineText] = useState(SAMPLE_TRANSCRIPT);

  const handleConfirm = (idx) => {
    setConfirmed(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const handleConfirmAll = () => {
    setConfirmed(EXTRACTED_ITEMS.map((_, i) => i));
  };

  const sortedMeetings = [...meetings].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalExtracted = meetings.reduce((s, m) => s + (m.extractedActionItems || 0), 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Operating Cadences</h1>
          <p className="text-sm text-gray-500 mt-0.5">Meeting rhythm, notes capture, and action item extraction</p>
        </div>
        <button
          onClick={() => setShowPipeline(!showPipeline)}
          className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 font-medium"
        >
          {showPipeline ? 'Back to Cadences' : 'Demo: Meeting → Action Pipeline'}
        </button>
      </div>

      {!showPipeline ? (
        <>
          {/* Cadence Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Cadence Schedule</h2>
            <div className="grid grid-cols-5 gap-3">
              {['Offerings', 'Markets', 'Industries', 'Engines', 'Growth & Strategy'].map(group => {
                const groupMeetings = meetings.filter(m => m.group === group);
                const cadences = [...new Set(groupMeetings.map(m => m.cadence))];
                return (
                  <div key={group} className="border border-gray-100 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-700 mb-2">{group}</div>
                    {groupMeetings.slice(0, 3).map(m => (
                      <div key={m.id} className="text-xs text-gray-500 mb-1">
                        <span className="font-medium text-gray-600">{m.cadence}</span> &middot; {m.scheduledDay}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase">Total Meetings</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{meetings.length}</div>
              <div className="text-xs text-gray-500">across 5 groups</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase">Action Items Extracted</div>
              <div className="text-2xl font-bold text-accent mt-1">{totalExtracted}</div>
              <div className="text-xs text-gray-500">from meeting notes via AI</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase">Pending Review</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{meetings.filter(m => m.status === 'pending_review').length}</div>
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
                  <div key={m.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50/50">
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
                            <span className="text-accent shrink-0 mt-0.5">&#8226;</span>
                            <span>{d}</span>
                          </div>
                        ))}
                        {m.keyDecisions.length > 2 && (
                          <div className="text-[10px] text-gray-400">+{m.keyDecisions.length - 2} more decisions</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Meeting → Action Item Pipeline Demo */
        <div>
          <div className="bg-accent/5 border border-accent/10 rounded-lg p-3 mb-4 text-xs text-accent">
            This demo shows how meeting notes are captured and AI extracts structured action items — reducing manual work for leaders.
          </div>
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Raw Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Raw Meeting Notes</h2>
              <div className="text-[10px] text-gray-400 mb-2">Leadership Cadence — Mar 24, 2026</div>
              <textarea
                value={pipelineText}
                onChange={e => setPipelineText(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg p-3 h-[420px] resize-none focus:outline-none focus:ring-1 focus:ring-accent bg-gray-50 leading-relaxed text-gray-700"
              />
            </div>

            {/* Right: Extracted Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">AI-Extracted Action Items</h2>
                <span className="text-xs text-accent font-medium">{EXTRACTED_ITEMS.length} items detected</span>
              </div>
              <div className="space-y-2 mb-4">
                {EXTRACTED_ITEMS.map((item, idx) => (
                  <div key={idx} className={`border rounded-lg p-3 transition-all ${confirmed.includes(idx) ? 'border-green-200 bg-green-50/50' : 'border-gray-100'}`}>
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={confirmed.includes(idx)}
                        onChange={() => handleConfirm(idx)}
                        className="rounded mt-0.5 shrink-0"
                      />
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">{item.description}</div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
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
                <div className="text-xs text-gray-400">{confirmed.length} of {EXTRACTED_ITEMS.length} confirmed</div>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmAll}
                    className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent/90 font-medium"
                  >
                    Confirm All
                  </button>
                </div>
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
