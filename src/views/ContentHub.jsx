import { Link } from 'react-router-dom';

const MOCK_CONTENT = [
  { id: 1, title: 'GenAI Talent Transformation Playbook', category: 'Methodology', tags: ['GenAI', 'Workforce'], updated: '2026-03-20', status: 'Published', downloads: 245 },
  { id: 2, title: 'Unified Talent Strategy Framework v3.0', category: 'Framework', tags: ['Strategy', 'Global'], updated: '2026-03-15', status: 'Draft', downloads: 0 },
  { id: 3, title: 'FSI Talent Advisory Sales Deck', category: 'Sales Enablement', tags: ['FSI', 'Banking', 'GenAI'], updated: '2026-03-18', status: 'Published', downloads: 128 },
  { id: 4, title: 'Change Management Toolkit v2.0', category: 'Toolkit', tags: ['ChangeManagement', 'Methodology'], updated: '2026-03-22', status: 'Published', downloads: 312 },
  { id: 5, title: 'Health Sector Talent Benchmarking Report', category: 'Thought Leadership', tags: ['Health', 'Benchmarking'], updated: '2026-03-14', status: 'Published', downloads: 203 },
  { id: 6, title: 'APAC Market Entry Playbook', category: 'Playbook', tags: ['APAC', 'Markets'], updated: '2026-03-10', status: 'In Review', downloads: 0 },
  { id: 7, title: 'Workforce Planning Platform User Guide', category: 'Product Docs', tags: ['HRTech', 'WorkforcePlanning'], updated: '2026-03-21', status: 'Published', downloads: 167 },
  { id: 8, title: 'Client Messaging Guidelines — Q3 FY26', category: 'Messaging', tags: ['Messaging', 'GlobalAlignment'], updated: '2026-03-19', status: 'Published', downloads: 89 },
];

const CATEGORIES = ['All', 'Methodology', 'Framework', 'Sales Enablement', 'Toolkit', 'Thought Leadership', 'Playbook', 'Messaging'];

export default function ContentHub() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Content Hub</h1>
        <p className="text-sm text-gray-500 mt-0.5">Centralized library for strategic frameworks, playbooks, and enablement materials</p>
      </div>

      {/* Phase 2 banner */}
      <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800">Phase 2 — Content Consistency & Distribution</div>
          <p className="text-xs text-gray-600 mt-0.5">
            This hub will address the second core challenge: getting consistent content to the right people at the right time.
            Leaders will be able to search, interact with, and receive push notifications when relevant materials are updated.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase">Total Content</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{MOCK_CONTENT.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase">Published</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{MOCK_CONTENT.filter(c => c.status === 'Published').length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase">Total Downloads</div>
          <div className="text-2xl font-bold text-accent mt-1">{MOCK_CONTENT.reduce((s, c) => s + c.downloads, 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase">In Review</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{MOCK_CONTENT.filter(c => c.status === 'In Review' || c.status === 'Draft').length}</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-4">
        {MOCK_CONTENT.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-semibold text-gray-800">{item.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.category} &middot; Updated {item.updated}</div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                item.status === 'Published' ? 'bg-green-50 text-green-600'
                : item.status === 'Draft' ? 'bg-gray-100 text-gray-500'
                : 'bg-amber-50 text-amber-600'
              }`}>{item.status}</span>
            </div>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {item.tags.map(t => <span key={t} className="text-[10px] bg-accent/5 text-accent px-1.5 py-0.5 rounded">{t}</span>)}
            </div>
            <div className="flex items-center justify-between">
              {item.downloads > 0 ? (
                <span className="text-xs text-gray-400">{item.downloads} downloads</span>
              ) : (
                <span className="text-xs text-gray-300">Not yet published</span>
              )}
              <button className="text-xs text-accent font-medium hover:underline">View &rarr;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
