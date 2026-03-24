# Stakeholder Requirements Traceability

Every specific request from Steve and Emily, mapped to where it appears in the demo.

---

## STEVE's Requirements

| # | Requirement | Source Quote | Demo Screen |
|---|------------|-------------|-------------|
| S1 | Single page per leader with four quadrants | "a single PowerPoint page with different, like four quadrants — financials, campaigns, strategic objectives" | Leader Strategy Page — 4-quadrant layout |
| S2 | Qualitative narrative text on each page | "it's got indicators, it's got updated metrics, it's got qualitative narrative information" | Leader Strategy Page — Q4 Narrative panel |
| S3 | Structured data fed by ops team, qualitative by leaders | "My team can feed the structured data" / leaders "feed their qualitative updates" | Q1 financials read-only, Q4 narrative editable |
| S4 | Pullable in meetings for live review | "we would be able to pull that up in a meeting... okay, what's your update?" | Any leader page — demo by clicking through grid |
| S5 | Must NOT feel like a timesheet | "they're not going to see as like an extra burden" | Topic-prompted narrative input, not blank forms |
| S6 | Front and center in Teams or similar | "front and center, whether that's in some team's thing" | Clean dashboard UI, demo-ready for Teams embed |
| S7 | Must accommodate delegation to deputies | "they delegate that to their deputy... which is fine but we just [need it] to work" | Deputy banner + attributed submissions |
| S8 | Translate meeting recaps into actionable plans | "we don't take that... input and translated into actionable plans" | Meeting → Action Item Pipeline (split screen) |
| S9 | Take existing inputs and carry them through | "taking existing inputs, like meeting stuff and translating that" | Meeting cadence view + auto-extraction |
| S10 | Hosted behind Accenture firewalls (security) | "talent, revenue, sales, profitability. Confidential. Cannot leave the walls of Accenture" | Demo disclaimer — production requires internal hosting |
| S11 | Scalable across multiple RPs | "we're not going to be the only RP wanting to do stuff like this" | Architecture supports multi-RP by design |
| S12 | Research existing Accenture tools | "Digital Worker... Amethyst... Planner... SharePoint" | Noted in roadmap — demo shows what's possible |
| S13 | Structured data/metrics + unstructured commentary against specific prompts/questions/topics | Teams chat: "combination of structured data/metrics, and unstructured commentary/text against specific prompts/questions/topics" | Narrative input has Topic/Prompt selector dropdown |
| S14 | Growth & Strategy team needs visibility | "Sissy and the growth and strategy team understand what we're trying to do" | Included as one of the 5 groups |
| S15 | ~30 leaders each needing a page | "there's probably at least 30 people" | 27 leaders in mock data across 5 groups |

---

## EMILY's Requirements

| # | Requirement | Source Quote | Demo Screen |
|---|------------|-------------|-------------|
| E1 | Five distinct groups running independent strategies | "offering leads... markets... industry experts" | 5 groups with independent dashboards per leader |
| E2 | Each group tracks own strategy independently | "All of them need to run separately" | Group filters on every view |
| E3 | Roll everything up into unified Talent RP view | "roll it up into a talent RPE strategy" | Executive Dashboard heatmap + KPI rollup |
| E4 | Different views for Steve and Emily | "track from Steve's perspective, from my perspective" | Persona switcher — 3 role-based dashboards |
| E5 | Help groups set up regular cadences | "how do we help them set up regular cadences" | Cadence view with meeting schedule + AI pipeline |
| E6 | Roll up information from groups to higher level | "how do we then roll that up" | Group health cards + master objective progress bars |
| E7 | Reduce leader time burden (biggest pain point) | "Anything we can do to reduce that" | Topic-prompted input, AI extraction, delegation |
| E8 | Enable delegation to team members | "push it to members of their team" | Deputy system with "Acting as" banner |
| E9 | Translate action items into visual tracking | "Translating action items into visual tracking pages" | Action items checklist + Gantt timeline |
| E10 | Show when things are NOT happening at required speed | "are things not happening in the speed that we need" | Overdue indicators, stale update warnings, red status chips |
| E11 | Gantt-style visual progress tracking | "some kind of gantt" | Emily's Strategy Dashboard — timeline/Gantt view |
| E12 | Cross-strategy intersection visibility | "I want to know if what I'm doing in banking is happening somewhere else" | Strategy Map — matrix + network graph views |
| E13 | See interconnects across different strategies | "what are the interconnects of all those different strategies" | Intersection detail panel with suggested coordination |
| E14 | Push notifications when things update | "pushing it out to people so that they know things are updated" | Notification bell + staleness alerts panel |
| E15 | Point-of-need access — relevant updates only | "if it can give the relevant updates for them" | Filtered feeds, role-based landing pages |
| E16 | Content consistency across org (Problem #2) | "hard to get consistency in messaging" | Content Hub (Phase 2 stub) |
| E17 | Dynamic content interaction | "help people digest and interact with content in a dynamic way" | Content Hub planned feature |
| E18 | Even as inspiration, helpful | "even if this is the inspiration for what it could look like" | This entire demo |

---

## Demo Walkthrough — Pointing Out Requirements

When presenting, use this script to explicitly reference stakeholder asks:

1. **Executive Heatmap** → "Steve, you said each leader needs a page [S1]. Here are all 30 [S15], color-coded by health. Emily, this rolls everything up [E3, E6]."

2. **Click into a leader** → "Steve, here's your four-quadrant vision [S1]. Financials from your team [S3], campaigns, objectives, and the narrative panel [S2]."

3. **Narrative Input** → "Steve, you said 'unstructured commentary against specific prompts' [S13]. See the topic selector? Leaders pick 'Risks & Blockers' or 'Client Developments' before writing. Emily, you can filter ALL updates by topic across every leader."

4. **Switch to Steve's View** → "Same data, operations lens [E4]. Sortable financial table, pipeline health. This is your morning dashboard [S4]."

5. **Switch to Emily's View** → "Emily, here's yours [E4]. Master objectives [E6], narrative feed [E15], and the Gantt timeline you asked for [E11]."

6. **Strategy Map** → "Emily, you asked 'where do things intersect' [E12, E13]. Irene and James are both working on GenAI in FSI. The system surfaces it automatically."

7. **Meeting Pipeline** → "Steve, you said you do recaps today but don't translate them into plans [S8, S9]. Watch this — notes go in, action items come out."

8. **Deputy View** → "Steve, you mentioned leaders delegate to deputies [S7]. Emily, you wanted to reduce their burden [E7, E8]. Here's how — deputy logs in, updates on behalf, fully attributed."

9. **Stale Alerts** → "Emily, you wanted to know when things aren't moving fast enough [E10]. Six leaders haven't updated in 14+ days. That flags automatically."

10. **Content Hub Stub** → "Emily, your second challenge — content consistency [E16]. Here's where that lives in Phase 2."
