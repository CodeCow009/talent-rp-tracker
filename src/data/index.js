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
