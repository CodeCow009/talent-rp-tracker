import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getLeader, getLeaderCampaigns, getLeaderIntersections } from '../data';

// Tag relevance per role
const ROLE_TAGS = {
  Executive: null, // sees everything
  Operations: ['Strategy', 'Global', 'OperatingModel', 'Competitive', 'Benchmarking'],
  Strategy: ['Strategy', 'GenAI', 'Methodology', 'Assessment', 'Framework', 'Global', 'Competitive'],
};

const MOCK_CONTENT = [
  { id: 1, title: 'GenAI Talent Transformation Playbook', category: 'Methodology', tags: ['GenAI', 'Workforce'], updated: '2026-03-20', status: 'Published', downloads: 245, description: 'Comprehensive guide for implementing GenAI-driven talent transformation across enterprise organizations. Includes frameworks, templates, and case studies.' },
  { id: 2, title: 'Unified Talent Strategy Framework v3.0', category: 'Framework', tags: ['Strategy', 'Global'], updated: '2026-03-15', status: 'Draft', downloads: 0, description: 'Updated strategic framework aligning all five groups under a unified talent RP vision. Third major revision incorporating Q2 stakeholder feedback.' },
  { id: 3, title: 'FSI Talent Advisory Sales Deck', category: 'Sales Enablement', tags: ['FSI', 'Banking', 'GenAI'], updated: '2026-03-18', status: 'Published', downloads: 128, description: 'Client-facing presentation for financial services talent advisory engagements. Features GenAI readiness assessment positioning.' },
  { id: 4, title: 'Change Management Toolkit v2.0', category: 'Toolkit', tags: ['ChangeManagement', 'Methodology'], updated: '2026-03-22', status: 'Published', downloads: 312, description: 'Practitioner toolkit for managing organizational change in talent transformation engagements. Includes stakeholder maps, comms templates, and risk frameworks.' },
  { id: 5, title: 'Health Sector Talent Benchmarking Report', category: 'Thought Leadership', tags: ['Health', 'Benchmarking'], updated: '2026-03-14', status: 'Published', downloads: 203, description: 'Industry benchmarking analysis of talent practices across 50+ health sector organizations. Published as thought leadership for client conversations.' },
  { id: 6, title: 'APAC Market Entry Playbook', category: 'Playbook', tags: ['APAC', 'Markets'], updated: '2026-03-10', status: 'In Review', downloads: 0, description: 'Strategic playbook for expanding talent advisory services in APAC markets. Covers regulatory, cultural, and competitive considerations.' },
  { id: 7, title: 'Workforce Planning Platform User Guide', category: 'Product Docs', tags: ['HRTech', 'WorkforcePlanning'], updated: '2026-03-21', status: 'Published', downloads: 167, description: 'End-user guide for the workforce planning analytics platform. Covers dashboards, scenario modeling, and integration with client HRIS systems.' },
  { id: 8, title: 'Client Messaging Guidelines — Q3 FY26', category: 'Messaging', tags: ['Messaging', 'GlobalAlignment'], updated: '2026-03-19', status: 'Published', downloads: 89, description: 'Unified messaging guide for Q3 FY26 ensuring consistency across all client-facing materials and conversations.' },
  { id: 9, title: 'GenAI Readiness Assessment Methodology', category: 'Methodology', tags: ['GenAI', 'Assessment'], updated: '2026-03-23', status: 'Published', downloads: 178, description: 'Step-by-step methodology for assessing organizational readiness for GenAI talent transformation. Scoring rubrics and maturity model included.' },
  { id: 10, title: 'Talent Operating Model Design Guide', category: 'Framework', tags: ['OperatingModel', 'Strategy'], updated: '2026-02-28', status: 'Published', downloads: 156, description: 'Guide for designing and implementing talent operating models for enterprise clients. Includes reference architectures and governance frameworks.' },
  { id: 11, title: 'Consultant Certification Curriculum — GenAI', category: 'Training', tags: ['GenAI', 'Certification', 'Internal'], updated: '2026-03-21', status: 'Published', downloads: 94, description: 'Internal training curriculum for consultant certification on GenAI talent advisory methodologies. 40-hour program with practical assessments.' },
  { id: 12, title: 'Competitive Intelligence Brief — Q3 FY26', category: 'Intelligence', tags: ['Competitive', 'Strategy'], updated: '2026-03-17', status: 'Published', downloads: 67, description: 'Quarterly competitive landscape analysis covering key competitors in talent advisory space. Positioning recommendations included.' },
];

const CATEGORIES = ['All', ...new Set(MOCK_CONTENT.map(c => c.category))];
const STATUSES = ['All', 'Published', 'Draft', 'In Review'];

export default function ContentHub({ persona }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [previewId, setPreviewId] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');

  const isLeaderOrDeputy = persona?.role === 'Leader' || persona?.role === 'Deputy';

  // Compute relevant tags for leader/deputy based on their themes
  let relevantTags = null;
  if (isLeaderOrDeputy) {
    const leader = getLeader(persona.leaderId);
    const campaigns = getLeaderCampaigns(persona.leaderId);
    const conns = getLeaderIntersections(persona.leaderId);
    const campaignTags = campaigns.flatMap(c => c.tags || []);
    const connThemes = conns.flatMap(c => c.sharedThemes || []);
    relevantTags = [...new Set([...campaignTags, ...connThemes, leader?.group, leader?.subGroup].filter(Boolean))];
  } else if (ROLE_TAGS[persona?.role]) {
    relevantTags = ROLE_TAGS[persona.role];
  }

  // Score content by relevance
  const scoredContent = MOCK_CONTENT.map(c => {
    let relevance = 0;
    if (relevantTags) {
      relevance = c.tags.filter(t => relevantTags.some(rt => t.toLowerCase().includes(rt.toLowerCase()) || rt.toLowerCase().includes(t.toLowerCase()))).length;
    }
    return { ...c, relevance };
  });

  // Sort: relevant first for leader/deputy
  const sortedContent = isLeaderOrDeputy
    ? [...scoredContent].sort((a, b) => b.relevance - a.relevance)
    : scoredContent;

  const filtered = sortedContent
    .filter(c => category === 'All' || c.category === category)
    .filter(c => status === 'All' || c.status === status)
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) || c.category.toLowerCase().includes(search.toLowerCase()))
    .concat(suggestions.map((s, i) => ({ ...s, id: `sug-${i}`, relevance: 0 })));

  const published = MOCK_CONTENT.filter(c => c.status === 'Published').length + suggestions.filter(s => s.status === 'Published').length;
  const totalDownloads = MOCK_CONTENT.reduce((s, c) => s + c.downloads, 0);
  const inReview = MOCK_CONTENT.filter(c => c.status === 'In Review' || c.status === 'Draft').length;

  // Chart data
  const catData = [...new Set(MOCK_CONTENT.map(c => c.category))].map(cat => ({
    name: cat.length > 12 ? cat.slice(0, 12) + '...' : cat,
    downloads: MOCK_CONTENT.filter(c => c.category === cat).reduce((s, c) => s + c.downloads, 0),
  })).sort((a, b) => b.downloads - a.downloads);

  const topContent = [...MOCK_CONTENT].sort((a, b) => b.downloads - a.downloads).slice(0, 3);

  const daysSince = (d) => Math.floor((new Date('2026-03-24') - new Date(d)) / 86400000);

  const handleSubmitSuggestion = () => {
    if (!formTitle.trim()) return;
    setSuggestions(prev => [...prev, {
      title: formTitle, category: formCategory || 'Uncategorized', tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      updated: '2026-03-24', status: 'Draft', downloads: 0, description: formDescription || 'Suggested content — pending review.',
    }]);
    setFormTitle(''); setFormCategory(''); setFormDescription(''); setFormTags(''); setShowUpload(false);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{isLeaderOrDeputy ? 'Resources' : persona?.role === 'Operations' ? 'Content Hub — Operations' : persona?.role === 'Strategy' ? 'Content Hub — Strategy' : 'Content Hub'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{isLeaderOrDeputy ? 'Content relevant to your campaigns and themes — sorted by relevance' : 'Centralized library for strategic frameworks, playbooks, and enablement materials'}</p>
        </div>
        <button onClick={() => setShowUpload(!showUpload)} className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 font-medium">
          {showUpload ? 'Cancel' : '+ Suggest Content'}
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="bg-white rounded-xl border border-accent/20 p-5 mb-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Suggest New Content</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Title" className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
            <input value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="Category" className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </div>
          <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Description..." className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 h-16 resize-none mb-3" />
          <div className="flex items-center gap-3">
            <input value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="Tags (comma-separated)" className="text-sm border border-gray-200 rounded-lg px-3 py-2 flex-1" />
            <button onClick={handleSubmitSuggestion} disabled={!formTitle.trim()} className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50">Submit</button>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex items-center gap-3 mb-4">
        <input type="text" placeholder="Search content..." value={search} onChange={e => setSearch(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-accent" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${category === c ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase">Total Content</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{MOCK_CONTENT.length + suggestions.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase">Published</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{published}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase">Total Downloads</div>
          <div className="text-2xl font-bold text-accent mt-1">{totalDownloads.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase">In Review / Draft</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{inReview}</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {filtered.map(item => {
          const stale = daysSince(item.updated) > 30;
          return (
            <div key={item.id} className={`bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow ${stale ? 'border-amber-200' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="text-sm font-semibold text-gray-800">{item.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.category} &middot; Updated {item.updated}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.relevance > 0 && <span className="text-[9px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">Relevant</span>}
                  {stale && <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">Stale</span>}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.status === 'Published' ? 'bg-green-50 text-green-600' : item.status === 'Draft' ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600'
                  }`}>{item.status}</span>
                </div>
              </div>
              {item.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>}
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {item.tags.map(t => <span key={t} className="text-[10px] bg-accent/5 text-accent px-1.5 py-0.5 rounded">{t}</span>)}
              </div>
              <div className="flex items-center justify-between">
                {item.downloads > 0 ? <span className="text-xs text-gray-400">{item.downloads} downloads</span> : <span className="text-xs text-gray-300">Not yet published</span>}
                <button onClick={() => setPreviewId(previewId === item.id ? null : item.id)} className="text-xs text-accent font-medium hover:underline">
                  {previewId === item.id ? 'Close' : 'Preview'} &rarr;
                </button>
              </div>
              {previewId === item.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Content Preview</div>
                  <p className="text-xs text-gray-500">{item.description}</p>
                  <div className="text-[10px] text-gray-400 mt-2">Full document would be rendered here in production.</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-[2fr_1fr] gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Downloads by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="downloads" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Most Popular</h3>
          <div className="space-y-3">
            {topContent.map((item, i) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                <div>
                  <div className="text-sm font-medium text-gray-700">{item.title}</div>
                  <div className="text-xs text-gray-400">{item.downloads} downloads &middot; {item.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
