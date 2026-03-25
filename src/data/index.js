import leadersRaw from './leaders.json';
import financialsRaw from './financials.json';
import campaignsRaw from './campaigns.json';
import objectivesRaw from './objectives.json';
import narrativesRaw from './narratives.json';
import actionItemsRaw from './actionItems.json';
import intersectionsRaw from './intersections.json';
import meetingsRaw from './meetings.json';

export const leaders = leadersRaw;
export const financials = financialsRaw;
export const campaigns = campaignsRaw;
export const narratives = narrativesRaw;
export const actionItems = actionItemsRaw;
export const intersections = intersectionsRaw;
export const meetings = meetingsRaw;

// Normalize objectives into a usable shape
export const masterObjectives = objectivesRaw.masterObjectives || [];
export const keyResults = (objectivesRaw.keyResults || []).map(kr => ({
  ...kr,
  parentId: kr.masterObjectiveId,
}));

// Helper functions
export function getLeader(id) {
  return leaders.find(l => l.id === id);
}

export function getFinancials(leaderId) {
  return financials.find(f => f.leaderId === leaderId);
}

export function getLeaderCampaigns(leaderId) {
  return campaigns.filter(c => c.leaderId === leaderId);
}

export function getLeaderKeyResults(leaderId) {
  return keyResults.filter(kr => kr.leaderId === leaderId);
}

export function getLeaderNarratives(leaderId) {
  return narratives.filter(n => n.leaderId === leaderId).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getLeaderActionItems(leaderId) {
  return actionItems.filter(a => a.leaderId === leaderId);
}

export function getLeaderIntersections(leaderId) {
  return intersections.filter(i => i.leaderAId === leaderId || i.leaderBId === leaderId);
}

export function getKeyResultsForObjective(objId) {
  return keyResults.filter(kr => kr.masterObjectiveId === objId);
}

export function daysSinceUpdate(dateStr) {
  return Math.floor((new Date('2026-03-24') - new Date(dateStr)) / 86400000);
}

export function fmt(n) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

export const GROUPS = ['Offerings', 'Markets', 'Industries', 'Engines', 'Growth & Strategy'];

// ============ MEETING TEMPLATES ============
export const MEETING_TEMPLATES = [
  { id: 'standard', name: 'Standard Meeting', description: 'General meeting with balanced extraction', promptHint: 'Extract action items, decisions, and key topics with equal weight.' },
  { id: 'standup', name: 'Daily Standup', description: 'Quick status sync — blockers and progress', promptHint: 'Focus on blockers (flag as high-priority risks), yesterday progress (key outcomes), and today plans (action items with category deliverable).' },
  { id: 'retrospective', name: 'Retrospective', description: 'What worked, what to improve', promptHint: 'Extract Start/Stop/Continue items. Focus on process improvements as action items and lessons learned.' },
  { id: 'strategy-review', name: 'Strategy Review', description: 'Objective alignment and progress', promptHint: 'Focus on objective progress, cross-strategy dependencies, and strategic pivots. Flag misalignments.' },
  { id: 'client-debrief', name: 'Client Debrief', description: 'Post-client meeting analysis', promptHint: 'Extract client sentiment, next steps, competitive signals, and follow-up actions with client names.' },
  { id: 'operating-cadence', name: 'Operating Cadence', description: 'Regular ops rhythm meeting', promptHint: 'Focus on financial updates, pipeline changes, resource needs, and escalations requiring leadership action.' },
];

// ============ TASK TYPES ============
export const TASK_TYPES = [
  { id: 'client-facing', label: 'Client-Facing', color: '#7C3AED' },
  { id: 'internal-process', label: 'Internal Process', color: '#059669' },
  { id: 'deliverable', label: 'Deliverable', color: '#2563EB' },
  { id: 'communication', label: 'Communication', color: '#D97706' },
  { id: 'research', label: 'Research', color: '#6366F1' },
  { id: 'decision-required', label: 'Decision Required', color: '#DC2626' },
];

export const COMPLEXITY_LEVELS = ['quick-win', 'standard', 'complex'];

// ============ ACTION COMPLETENESS SCORING ============
// Score: description clarity (40%) + owner (30%) + deadline (30%)
export function scoreActionCompleteness(action) {
  let descScore = 0;
  const desc = action.description || '';
  if (desc.length >= 10) descScore += 0.15;
  if (desc.length >= 25) descScore += 0.1;
  const actionVerbs = ['finalize', 'complete', 'send', 'submit', 'prepare', 'review', 'schedule', 'coordinate', 'deliver', 'launch', 'follow', 'organize', 'resolve', 'assign', 'build', 'create', 'update', 'share', 'confirm', 'escalate', 'request', 'provide', 'bring', 'set'];
  if (actionVerbs.some(v => desc.toLowerCase().startsWith(v))) descScore += 0.15;

  const ownerScore = (action.owner && action.owner !== 'Unassigned') ? 0.3 : 0;
  const deadlineScore = action.dueDate ? 0.3 : 0;
  const score = Math.min(1, descScore + ownerScore + deadlineScore);

  const suggestions = [];
  if (descScore < 0.3) suggestions.push('Start with an action verb and be more specific');
  if (!ownerScore) suggestions.push('Assign an owner');
  if (!deadlineScore) suggestions.push('Set a due date');

  return { score: Math.round(score * 100) / 100, breakdown: { description: Math.round(descScore * 100), owner: Math.round(ownerScore * 100), deadline: Math.round(deadlineScore * 100) }, suggestions };
}

// ============ TASK TYPE INFERENCE ============
export function inferTaskType(action) {
  const d = (action.description || '').toLowerCase();
  if (d.includes('client') || d.includes('chro') || d.includes('proposal') || d.includes('pilot') || d.includes('presentation') || d.includes('rfp') || d.includes('outreach')) return 'client-facing';
  if (d.includes('coordinate') || d.includes('align') || d.includes('organize') || d.includes('send') || d.includes('follow up') || d.includes('escalate')) return 'communication';
  if (d.includes('finalize') || d.includes('complete') || d.includes('build') || d.includes('launch') || d.includes('deliver') || d.includes('prepare')) return 'deliverable';
  if (d.includes('review') || d.includes('research') || d.includes('assess') || d.includes('benchmark') || d.includes('analysis')) return 'research';
  if (d.includes('decision') || d.includes('approve') || d.includes('request') || d.includes('confirm')) return 'decision-required';
  return 'internal-process';
}

// ============ COMPLEXITY INFERENCE ============
export function inferComplexity(action) {
  const d = (action.description || '').toLowerCase();
  if (d.includes('schedule') || d.includes('send') || d.includes('follow up') || d.includes('confirm') || d.includes('assign')) return 'quick-win';
  if (d.includes('build') || d.includes('develop') || d.includes('finalize') || d.includes('launch') || d.includes('architecture') || d.includes('framework')) return 'complex';
  return 'standard';
}

// ============ SEMANTIC DEDUPLICATION ============
// Simple character-level similarity using bigrams
function bigramSimilarity(a, b) {
  const getBigrams = (s) => {
    const lower = s.toLowerCase();
    const bigrams = new Set();
    for (let i = 0; i < lower.length - 1; i++) bigrams.add(lower.slice(i, i + 2));
    return bigrams;
  };
  const setA = getBigrams(a);
  const setB = getBigrams(b);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  return (2 * intersection) / (setA.size + setB.size) || 0;
}

export function findDuplicateActions(items, threshold = 0.6) {
  const duplicates = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const sim = bigramSimilarity(items[i].description, items[j].description);
      if (sim >= threshold) {
        duplicates.push({ itemA: items[i].id, itemB: items[j].id, similarity: Math.round(sim * 100) });
      }
    }
  }
  return duplicates;
}

// ============ FULL-TEXT SEARCH ============
export function searchAll(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results = [];

  // Search meetings
  meetings.forEach(m => {
    if (m.title.toLowerCase().includes(q) || m.keyDecisions?.some(d => d.toLowerCase().includes(q)) || m.executiveSummary?.toLowerCase().includes(q)) {
      results.push({ type: 'meeting', id: m.id, title: m.title, subtitle: `${m.group} · ${m.date}`, to: '/cadences', match: m.keyDecisions?.find(d => d.toLowerCase().includes(q)) || m.title });
    }
  });

  // Search action items
  actionItems.forEach(a => {
    if (a.description.toLowerCase().includes(q) || a.owner?.toLowerCase().includes(q)) {
      results.push({ type: 'action', id: a.id, title: a.description, subtitle: `${a.owner} · ${a.status}`, to: '/action-items', match: a.description });
    }
  });

  // Search narratives
  narratives.forEach(n => {
    if (n.content.toLowerCase().includes(q) || n.topic?.toLowerCase().includes(q) || n.tags?.some(t => t.toLowerCase().includes(q))) {
      const leader = leaders.find(l => l.id === n.leaderId);
      results.push({ type: 'narrative', id: n.id, title: `${leader?.name}: ${n.topic}`, subtitle: n.date, to: `/leaders/${n.leaderId}`, match: n.content.slice(0, 80) });
    }
  });

  // Search leaders
  leaders.forEach(l => {
    if (l.name.toLowerCase().includes(q) || l.title?.toLowerCase().includes(q) || l.group?.toLowerCase().includes(q) || l.subGroup?.toLowerCase().includes(q)) {
      results.push({ type: 'leader', id: l.id, title: l.name, subtitle: `${l.title} · ${l.group}`, to: `/leaders/${l.id}`, match: l.name });
    }
  });

  // Search key results
  keyResults.forEach(kr => {
    if (kr.description.toLowerCase().includes(q)) {
      const leader = leaders.find(l => l.id === kr.leaderId);
      results.push({ type: 'objective', id: kr.id, title: kr.description, subtitle: `${leader?.name} · ${kr.status}`, to: `/leaders/${kr.leaderId}`, match: kr.description });
    }
  });

  // Search campaigns
  campaigns.forEach(c => {
    if (c.name?.toLowerCase().includes(q)) {
      results.push({ type: 'campaign', id: c.id, title: c.name, subtitle: `${c.type} · ${c.status}`, to: `/leaders/${c.leaderId}`, match: c.name });
    }
  });

  // Search intersections
  intersections.forEach(inter => {
    if (inter.description?.toLowerCase().includes(q) || inter.sharedThemes?.some(t => t.toLowerCase().includes(q))) {
      results.push({ type: 'intersection', id: inter.id, title: `${inter.leaderAName} ↔ ${inter.leaderBName}`, subtitle: inter.sharedThemes.join(', '), to: '/strategy-map', match: inter.description?.slice(0, 80) });
    }
  });

  return results.slice(0, 30);
}

// ============ NUDGE TEMPLATES ============
export function generateNudgeMessage(action, senderName, role) {
  const overdueDays = Math.floor((new Date('2026-03-24') - new Date(action.dueDate)) / 86400000);

  if (role === 'Leader' || role === 'Deputy') {
    return `Hi ${action.owner?.split(' ')[0]},\n\nJust following up on: "${action.description}"\nThis was due ${action.dueDate}${overdueDays > 0 ? ` (${overdueDays}d ago)` : ''}.\n\nCould you provide a quick status update? If it's blocked, let me know how I can help.\n\nThanks,\n${senderName}`;
  }
  if (role === 'Operations') {
    return `Hi ${action.owner?.split(' ')[0]},\n\nFollowing up on an overdue item that's impacting our Q3 delivery timeline:\n\n"${action.description}"\nDue: ${action.dueDate}${overdueDays > 0 ? ` (${overdueDays} days overdue)` : ''}\n\nPlease provide a status update and expected completion date at your earliest convenience.\n\nBest,\n${senderName}`;
  }
  if (role === 'Executive') {
    return `Hi ${action.owner?.split(' ')[0]},\n\nI'm flagging this item which has been overdue for ${overdueDays} days:\n\n"${action.description}"\nOriginal due date: ${action.dueDate}\n\nPlease escalate any blockers so we can resolve them. I'd like a status update by end of day.\n\n${senderName}`;
  }
  return `Hi ${action.owner?.split(' ')[0]},\n\nQuick check-in on: "${action.description}"\nDue: ${action.dueDate}${overdueDays > 0 ? ` (${overdueDays}d overdue)` : ''}\n\nAny update on progress or blockers?\n\nThanks,\n${senderName}`;
}

// ============ PERFORMANCE / STRENGTH INTELLIGENCE ============
export function computePerformanceStats(leaderId) {
  const myActions = actionItems.filter(a => a.leaderId === leaderId);
  const completed = myActions.filter(a => a.status === 'completed' || a.status === 'complete');
  const total = myActions.length;
  const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  // By task type
  const byType = {};
  TASK_TYPES.forEach(t => {
    const typed = myActions.filter(a => inferTaskType(a) === t.id);
    const typedComplete = typed.filter(a => a.status === 'completed' || a.status === 'complete');
    const avgDays = typedComplete.length > 0 ? Math.round(typedComplete.reduce((s, a) => {
      return s + Math.max(0, (new Date(a.completedDate || a.dueDate) - new Date(a.createdDate)) / 86400000);
    }, 0) / typedComplete.length) : null;
    byType[t.id] = { total: typed.length, completed: typedComplete.length, rate: typed.length > 0 ? Math.round((typedComplete.length / typed.length) * 100) : 0, avgDays };
  });

  // Streak: consecutive on-time completions (most recent first)
  const sortedCompleted = completed.filter(a => a.completedDate && a.dueDate).sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
  let streak = 0;
  for (const a of sortedCompleted) {
    if (new Date(a.completedDate) <= new Date(a.dueDate)) streak++;
    else break;
  }

  // Strongest type (highest completion rate with at least 2 items)
  const strongestType = Object.entries(byType).filter(([_, v]) => v.total >= 2).sort((a, b) => b[1].rate - a[1].rate)[0];

  return { total, completed: completed.length, completionRate, byType, streak, strongestType: strongestType ? strongestType[0] : null };
}
