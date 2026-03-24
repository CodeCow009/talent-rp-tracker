# Talent RP Strategy Tracker — Full UI/UX Specification

## Overview & Purpose

A role-based strategic dashboard that gives Carolee's expanded leadership team (~30 MDs across 5 groups) a single system to track both **structured metrics** and **unstructured qualitative commentary** against specific strategic topics. The system rolls individual leader strategies up into a unified Talent Reinvention Partner view for Steve (operations), Emily (strategy/chief of staff), and Carolee (executive).

**Critical design constraint from Steve:** "A combination of structured data/metrics, and unstructured commentary/text against specific prompts/questions/topics." This means every tracking surface has TWO layers — numbers AND narrative — side by side.

**Critical UX constraint from Steve:** Must NOT feel like a timesheet. Must feel like a natural productivity tool that leaders can delegate to deputies. Front and center, not buried.

---

## Design Direction

**Aesthetic:** Executive-grade, clean, confident. Think Bloomberg Terminal meets Notion — data-dense but never cluttered. Dark sidebar navigation with a light content area. No playful colors. This is for MDs who run billion-dollar practices.

**Typography:** Use a sharp sans-serif like "DM Sans" for body text and "Instrument Serif" or "Playfair Display" for headlines/leader names. The contrast between serif headlines and sans-serif data creates visual hierarchy without clutter.

**Color System:**
- Background: `#FAFBFC` (light gray-white)
- Sidebar: `#1A1D23` (near-black)
- Primary accent: `#2563EB` (strong blue — Accenture-adjacent without being Accenture purple)
- Success: `#16A34A` (green)
- Warning: `#F59E0B` (amber)
- Danger: `#DC2626` (red)
- Neutral text: `#374151` (dark gray)
- Muted text: `#9CA3AF` (medium gray)
- Card backgrounds: `#FFFFFF`
- Card borders: `#E5E7EB`

**Status chips:** Rounded pills with colored backgrounds:
- On Track → green bg, white text
- At Risk → amber bg, dark text
- Behind → red bg, white text
- Completed → blue bg, white text
- Not Started → gray bg, dark text

---

## Global Navigation (Persistent Sidebar)

Dark sidebar, always visible on the left. Width: 240px collapsed to 64px (icon-only) on smaller screens.

```
┌──────────────────────┐
│  [Logo] TALENT RP     │
│  Strategy Tracker     │
│                       │
│  ─────────────────    │
│                       │
│  🏠 Dashboard         │  ← Role-based landing (adapts to user)
│  👥 All Leaders       │  ← Grid of all ~30 leaders
│  📊 Strategy Map      │  ← Cross-strategy intersection view
│  ✅ Action Items      │  ← Master action tracker
│  📅 Cadences          │  ← Meeting cadence tracker
│  📚 Content Hub       │  ← (Phase 2 — stub it for now)
│                       │
│  ─────────────────    │
│                       │
│  ⚙️ Settings          │
│                       │
│  ─────────────────    │
│  [Avatar] User Name   │
│  Role: Operations Dir │
│  ▾ Switch View        │  ← For demo: toggle between personas
│                       │
└──────────────────────┘
```

### Demo-Specific Feature: View Switcher

At the bottom of the sidebar, include a dropdown that lets you switch between personas during the demo:
- **Carolee (Executive)** — sees executive dashboard
- **Steve (Operations)** — sees ops-focused dashboard
- **Emily (Strategy)** — sees strategy-focused dashboard
- **Irene Bletcher (Market Lead)** — sees individual leader view
- **Deputy View** — sees leader view with "Acting as" banner

This is the killer demo feature. You click "Steve" and the whole dashboard reshapes. Click "Emily" and it's a different experience. Click "Irene" and you see a single leader's world. Same data, different lenses.

---

## Screen 1: Executive Dashboard (Carolee's View)

**URL:** `/dashboard` (when logged in as Carolee)
**Purpose:** 30-second health check of the entire Talent RP organization

### Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ "Talent RP Strategy Overview"          Last updated: Mar 24  │
│ [Filter: All Groups ▾]  [Time: Q3 FY26 ▾]                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │REVENUE  │ │PIPELINE │ │OBJECTIVES│ │LEADERS  │           │
│  │$142.8M  │ │$287.3M  │ │68% On   │ │24 of 30 │           │
│  │vs $168M │ │2.1x cov │ │Track    │ │Updated  │           │
│  │▼ 85%    │ │▲ Good   │ │▼ 4 Risk │ │▼ 6 Stale│           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  GROUP HEALTH SUMMARY (5 cards in a row)                     │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────┐│
│  │OFFERINGS │ │MARKETS   │ │INDUSTRIES│ │ENGINES   │ │G&S ││
│  │ 🟢 Good  │ │ 🟡 Watch │ │ 🔴 Risk  │ │ 🟢 Good  │ │ 🟢 ││
│  │ 92% rev  │ │ 78% rev  │ │ 64% rev  │ │ 91% rev  │ │88% ││
│  │ 12 obj   │ │ 18 obj   │ │ 14 obj   │ │ 8 obj    │ │6obj││
│  │ 2 leads  │ │ 4 leads  │ │ 3 leads  │ │ 2 leads  │ │2   ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────┘│
│                                                               │
├───────────────────────────────┬──────────────────────────────┤
│                               │                              │
│  LEADER HEATMAP GRID          │  ALERTS & ATTENTION          │
│  (30 cells, 6x5 or 5x6)      │                              │
│                               │  ⚠️ Stale Updates            │
│  Each cell:                   │  • R. Kumar — 22 days        │
│  ┌──────────────┐             │  • L. Torres — 18 days       │
│  │ Name         │             │  • M. Ahmed — 15 days        │
│  │ Group tag    │             │                              │
│  │ Rev: 85% ██░ │             │  🔴 At Risk Objectives       │
│  │ Obj: 3/4 ✓   │             │  • "APAC market entry" — 23% │
│  │ Updated: 2d  │             │  • "AI offering launch" — 31%│
│  └──────────────┘             │                              │
│                               │  🔗 New Intersections        │
│  Color = overall health       │  • 3 overlaps detected       │
│  Click → leader strategy pg   │    this week                 │
│                               │                              │
└───────────────────────────────┴──────────────────────────────┘
```

### Component Details:

**KPI Summary Row (top):**
- 4 cards, equal width, across the top
- Each shows: metric name, big number, comparison/target, trend indicator (▲▼)
- Revenue card: actual vs target with % achievement
- Pipeline card: total value with coverage ratio
- Objectives card: % on track with count at risk
- Leaders card: how many have updated recently vs total (staleness metric)

**Group Health Cards:**
- 5 cards in a horizontal row, one per group
- Each shows: group name, health indicator (colored dot), revenue % to target, # of strategic objectives, # of leaders in group
- Clicking a group card filters the heatmap below to only show that group's leaders

**Leader Heatmap Grid:**
- 30 cells arranged in a grid (responsive — 6 columns on desktop, 3 on tablet)
- Each cell is a card with: leader name, group tag (small colored chip), revenue % bar, objectives summary (3/4 complete), days since last update
- Cell background color tints based on overall health: green tint for healthy, yellow tint for watch, red tint for risk, gray tint for stale
- Hovering shows a tooltip with more detail
- Clicking navigates to that leader's full strategy page

**Alerts Panel (right side):**
- Three sections stacked vertically
- "Stale Updates" — leaders who haven't posted a narrative update in 14+ days, sorted by staleness
- "At Risk Objectives" — key results with status = At Risk or Behind, showing progress %
- "New Intersections" — recently detected strategy overlaps, clickable to Strategy Map
- Each alert item is clickable — navigates to the relevant leader page or strategy map

---

## Screen 2: Operations Dashboard (Steve's View)

**URL:** `/dashboard` (when logged in as Steve)
**Purpose:** Financial and operational performance across all leaders

### Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ "Operations Overview"              [Period: Q3 FY26 ▾]      │
│ [Group: All ▾] [Metric: Revenue ▾]                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  TOP KPI BAR (same 4-card pattern as Carolee but ops-focused)│
│                                                               │
│  Total Revenue    Total Pipeline   Avg Chargeability  Margin  │
│  $142.8M / $168M  $287.3M          87.2%              28.4%  │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  FINANCIAL PERFORMANCE TABLE                                  │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Leader    │Group    │Rev Target│Rev Actual│% │Pipeline│Win││
│  │───────────│─────────│──────────│──────────│──│────────│───││
│  │I.Bletcher │Markets  │$14.2M    │$11.8M    │83│$22.5M  │34%││
│  │J.Park     │Industry │$8.7M     │$5.6M     │64│$9.1M   │28%││
│  │...        │...      │...       │...       │..│...     │...││
│  └──────────────────────────────────────────────────────────┘│
│  Sortable columns. Revenue % column has inline colored bars.  │
│  Row click → leader strategy page.                            │
│                                                               │
├──────────────────────────────┬──────────────────────────────┤
│                              │                               │
│  REVENUE BY GROUP            │  PIPELINE HEALTH SCATTER      │
│  (Stacked bar chart)         │  (Bubble chart)               │
│                              │                               │
│  Shows 5 groups as stacked   │  X = Pipeline Coverage        │
│  bars, target line overlay   │  Y = Win Rate                 │
│  Last 4 quarters             │  Size = Revenue               │
│                              │  Each dot = a leader          │
│                              │  Quadrants labeled:           │
│                              │  "Strong" / "Growing" /       │
│                              │  "Watch" / "Risk"             │
│                              │                               │
└──────────────────────────────┴──────────────────────────────┘
```

### Component Details:

**Financial Performance Table:**
- This is Steve's primary view — he'll look at this every day
- All 30 leaders as rows, sortable by any column
- Key columns: Leader Name, Group, Revenue Target, Revenue Actual, % to Target (with inline progress bar), Pipeline Value, Pipeline Coverage, Win Rate, Profitability, Chargeability
- The % to Target column should have a small horizontal bar inside the cell, colored by threshold (green >85%, yellow 70-85%, red <70%)
- Clicking any row navigates to that leader's strategy page
- Search/filter bar at top of table

**Revenue by Group Chart:**
- Grouped or stacked bar chart showing the 5 groups
- Each bar shows actual vs target with target as a dashed line overlay
- Last 4 quarters side by side for trend
- Use chart.js or recharts

**Pipeline Health Scatter:**
- Bubble chart / scatter plot
- Each bubble is a leader — hover shows name and details
- X-axis: pipeline coverage ratio (higher = more pipeline relative to remaining target)
- Y-axis: win rate
- Bubble size: absolute revenue
- Draw quadrant lines at median values creating 4 zones: Strong (high coverage, high win rate), Growing (high coverage, low win rate), Watch (low coverage, high win rate), Risk (low coverage, low win rate)
- Color bubbles by group

---

## Screen 3: Strategy Dashboard (Emily's View)

**URL:** `/dashboard` (when logged in as Emily)
**Purpose:** Strategic progress, qualitative updates, and cross-strategy visibility

### Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ "Strategy & Progress"           [Group: All ▾] [Period ▾]    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  MASTER OBJECTIVES PROGRESS                                   │
│  (Carolee's 5-6 top-level strategic priorities)              │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ 1. "Establish GenAI talent advisory..."               │   │
│  │    ████████████░░░░░░░░  62%  (8/13 KRs on track)    │   │
│  │                                                       │   │
│  │ 2. "Expand market presence in APAC..."                │   │
│  │    ██████░░░░░░░░░░░░░░  38%  (3/8 KRs on track)    │   │
│  │                                                       │   │
│  │ 3. "Drive 15% profitability improvement..."           │   │
│  │    ██████████████░░░░░░  74%  (6/8 KRs on track)    │   │
│  │                                                       │   │
│  │ 4. "Build next-gen workforce planning capability..."  │   │
│  │    ████████████████░░░░  81%  (5/6 KRs on track)    │   │
│  │                                                       │   │
│  │ 5. "Unify talent strategy messaging globally..."      │   │
│  │    ████░░░░░░░░░░░░░░░░  22%  (2/9 KRs on track)    │   │
│  └───────────────────────────────────────────────────────┘   │
│  Click any objective → expands to show all mapped KRs        │
│                                                               │
├──────────────────────────────┬──────────────────────────────┤
│                              │                               │
│  LATEST UPDATES FEED         │  TIMELINE / GANTT VIEW        │
│  (Narrative updates from     │  (All key results on a        │
│   all leaders, unified)      │   horizontal timeline)        │
│                              │                               │
│  ┌────────────────────────┐  │  ┌────────────────────────┐  │
│  │ 📝 I. Bletcher         │  │  │  Jan  Feb  Mar  Apr    │  │
│  │ Markets — 2 hours ago  │  │  │  ═══════■══════        │  │
│  │ "Met with Citi CHRO... │  │  │     ════════■════      │  │
│  │  Strong interest in    │  │  │  ══■                   │  │
│  │  GenAI readiness..."   │  │  │        ════════════■   │  │
│  │ 🏷️ GenAI, FSI, Citi    │  │  │  ═════════■           │  │
│  │ 🔗 Obj: GenAI Advisory │  │  │     ══════════════■   │  │
│  │ 😊 Sentiment: Positive │  │  │                        │  │
│  ├────────────────────────┤  │  │  ■ = milestone         │  │
│  │ 📝 J. Park (Deputy)    │  │  │  Color = status        │  │
│  │ Industry — 1 day ago   │  │  │  Green/Yellow/Red      │  │
│  │ "Banking methodology   │  │  └────────────────────────┘  │
│  │  v2 delayed due to..."│  │                               │
│  │ 🏷️ Banking, Methodology│  │  Filters:                    │
│  │ 🔗 Obj: GenAI Advisory │  │  [Group ▾] [Objective ▾]     │
│  │ ⚠️ Sentiment: Cautious │  │  [Leader ▾] [Status ▾]      │
│  ├────────────────────────┤  │                               │
│  │ 📝 R. Kumar            │  │                               │
│  │ Offerings — 3 days ago │  │                               │
│  │ ...                    │  │                               │
│  └────────────────────────┘  │                               │
│                              │                               │
│  [Filter: All Groups ▾]     │                               │
│  [Filter: Sentiment ▾]      │                               │
│  [Search updates...]        │                               │
│                              │                               │
└──────────────────────────────┴──────────────────────────────┘
```

### Component Details:

**Master Objectives Progress:**
- Each of Carolee's 5-6 strategic priorities shown as a row
- Wide progress bar showing aggregate completion across all mapped key results
- Text showing fraction of KRs on track
- Click to expand → shows all key results mapped to this objective, grouped by leader, with individual status chips
- This is the "are we on track" view Emily needs

**Latest Updates Feed:**
- Reverse-chronological feed of ALL narrative updates across ALL leaders
- Each update card shows: leader name & avatar, group tag, timestamp, narrative text (truncated with "read more"), auto-extracted tags as clickable chips, linked objective(s), sentiment indicator (emoji or colored dot)
- Filter controls: by group, by sentiment, by leader, search text
- If a deputy authored it, show "by [Deputy] on behalf of [Leader]"
- This feed is Emily's morning scan — she reads it in 2-3 minutes to know what's happening

**Gantt Timeline:**
- Horizontal timeline showing key results as bars
- X-axis: months (Jan through Dec or relevant fiscal period)
- Each bar = one key result, positioned by start date and target date
- Milestones shown as diamonds on the bar
- Bar color = status (green/yellow/red)
- Bars grouped by master objective OR by leader (toggle)
- Hover on bar → tooltip with key result name, leader, progress %, next milestone
- Click bar → navigates to leader's strategy page, scrolled to that objective

**Intersection Callout:**
- Small panel or floating card that says "3 strategy overlaps detected" with a link to Strategy Map
- Shows the most significant new intersection briefly

---

## Screen 4: Individual Leader Strategy Page

**URL:** `/leaders/{leader-id}`
**Purpose:** The "single page per leader" Steve described — the atomic unit of the entire system

### Layout — The Four Quadrant View:

```
┌─────────────────────────────────────────────────────────────┐
│ LEADER HEADER                                                │
│ ┌────┐                                                       │
│ │ AV │ Irene Bletcher                    [Edit] [Delegate]  │
│ └────┘ Americas Market Lead                                  │
│        Group: Markets                                        │
│        Deputy: Sarah Chen                                    │
│        Last updated: 2 hours ago                             │
│        Overall Health: 🟡 Watch                               │
│                                                               │
│  ┌─ Acting as: Sarah Chen (Deputy) ─────────────────────┐   │
│  │ You are updating on behalf of Irene Bletcher          │   │
│  └───────────────────────────────────────────────────────┘   │
│  (This banner only shows when a deputy is logged in)         │
│                                                               │
├──────────────────────────────┬──────────────────────────────┤
│                              │                               │
│  Q1: STRUCTURED METRICS      │  Q2: CAMPAIGNS & INITIATIVES │
│  (Fed by Steve's team)       │  (Leader/deputy updates)      │
│                              │                               │
│  Revenue                     │  ┌──────────────────────────┐│
│  ┌─────────────────────┐     │  │ GenAI Talent Strategy    ││
│  │ $11.8M / $14.2M     │     │  │ for FSI                  ││
│  │ ████████████░░░ 83%  │     │  │ 🟢 Active  High Priority││
│  └─────────────────────┘     │  │ Progress: ████░░ 60%     ││
│                              │  │ Target: Jun 30, 2026     ││
│  Pipeline     Chargeability  │  │ Next: Submit proposal    ││
│  $22.5M       87%            │  │ Client: Citi             ││
│  1.6x cover   ▲ +2%         │  └──────────────────────────┘│
│                              │  ┌──────────────────────────┐│
│  Win Rate     Profitability  │  │ HR Tech Modernization    ││
│  34%          28%            │  │ Program                  ││
│  ▼ -3%        ─ flat        │  │ 🟡 At Risk  High Priority││
│                              │  │ Progress: ███░░░ 45%     ││
│  Headcount    Open Roles     │  │ Target: May 15, 2026     ││
│  142          8              │  │ Next: Vendor shortlist   ││
│                              │  └──────────────────────────┘│
│  [Sparkline: 4-qtr revenue   │  ┌──────────────────────────┐│
│   trend]                     │  │ Workforce Planning       ││
│                              │  │ Advisory Expansion       ││
│  ℹ️ Data sourced by           │  │ 🟢 Active  Med Priority  ││
│    Operations team           │  │ Progress: ██████░ 78%    ││
│                              │  │ ...                      ││
│                              │  └──────────────────────────┘│
│                              │                               │
│  [Read-only for leader]      │  [+ Add Campaign]            │
│                              │                               │
├──────────────────────────────┬──────────────────────────────┤
│                              │                               │
│  Q3: STRATEGIC OBJECTIVES    │  Q4: NARRATIVE & COMMENTARY  │
│  (OKRs mapped to Carolee's   │  (Unstructured updates)      │
│   master objectives)         │                               │
│                              │  "Against specific prompts/  │
│  Objective 1: GenAI Advisory │   questions/topics" — Steve  │
│  ┌─────────────────────────┐ │                               │
│  │ KR: Launch assessment   │ │  LATEST UPDATE               │
│  │ tool for 3 FSI clients  │ │  ┌──────────────────────────┐│
│  │ ████████░░░░ 60%        │ │  │ Mar 22, 2026             ││
│  │ Due: May 30 │ 🟢 On Trk │ │  │ by Sarah Chen (Deputy)   ││
│  │ ─────────●───────       │ │  │                          ││
│  │ Jan  Feb  Mar  Apr  May │ │  │ "Met with Citi CHRO last ││
│  └─────────────────────────┘ │  │  week. Strong interest in ││
│                              │  │  our GenAI readiness      ││
│  ┌─────────────────────────┐ │  │  framework but want pilot ││
│  │ KR: Train 50 consultants│ │  │  before committing.      ││
│  │ on GenAI methodology    │ │  │  Working with delivery   ││
│  │ ██████████████░ 85%     │ │  │  team on 4-week scope.   ││
│  │ Due: Apr 15 │ 🟢 On Trk │ │  │  Risk: need methodology  ││
│  └─────────────────────────┘ │  │  from offering team."    ││
│                              │  │                          ││
│  Objective 2: APAC Expansion │  │  🏷️ GenAI FSI Citi Pilot  ││
│  ┌─────────────────────────┐ │  │  🔗 → GenAI Advisory obj  ││
│  │ KR: Establish 2 APAC    │ │  └──────────────────────────┘│
│  │ client relationships    │ │                               │
│  │ ███░░░░░░░░░ 23%        │ │  PREVIOUS UPDATES            │
│  │ Due: Aug 31 │ 🔴 Behind │ │  ┌──────────────────────────┐│
│  └─────────────────────────┘ │  │ Mar 15, 2026             ││
│                              │  │ by Irene Bletcher        ││
│  [+ Add Key Result]         │  │ "Quarterly review with   ││
│                              │  │  Americas team completed. ││
│                              │  │  Pipeline healthy but..." ││
│                              │  └──────────────────────────┘│
│                              │                               │
│                              │  ┌──────────────────────────┐│
│                              │  │ ✏️ ADD NEW UPDATE          ││
│                              │  │ [Topic/Prompt ▾]          ││
│                              │  │ ┌────────────────────────┐││
│                              │  │ │ Type your update...    │││
│                              │  │ │                        │││
│                              │  │ └────────────────────────┘││
│                              │  │ [Link Objective ▾]        ││
│                              │  │ [Auto-tag] [Submit]       ││
│                              │  └──────────────────────────┘│
│                              │                               │
└──────────────────────────────┴──────────────────────────────┘

BELOW THE QUADRANTS:

┌─────────────────────────────────────────────────────────────┐
│  ACTION ITEMS                                    [+ Add]    │
│                                                               │
│  OVERDUE (2)                                                 │
│  ☐ 🔴 Send revised pilot scope to Citi — Due Mar 20         │
│  ☐ 🔴 Review APAC partner shortlist — Due Mar 18             │
│                                                               │
│  IN PROGRESS (3)                                             │
│  ☐ 🟡 Coordinate with Banking on GenAI methodology — Apr 5  │
│  ☐ 🟡 Draft Q4 pipeline acceleration plan — Apr 10          │
│  ☐ 🟡 Schedule APAC stakeholder calls — Apr 1               │
│                                                               │
│  COMPLETED (5) ▾ collapsed                                   │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  CONNECTIONS                                                  │
│  Your strategy intersects with:                              │
│  • James Park (Banking Industry) — GenAI + FSI overlap       │
│  • Wei Zhang (APAC Market) — APAC expansion alignment        │
│  • Raj Patel (Offerings) — Methodology dependency            │
│  [View on Strategy Map →]                                    │
└─────────────────────────────────────────────────────────────┘
```

### Critical UX Detail — The Narrative Input (Q4)

Steve said: "unstructured commentary/text against specific prompts/questions/topics"

This means the narrative update isn't totally freeform. There should be a **Topic/Prompt selector** that frames the update. Mock prompts:

- "Client & Market Developments" — what's happening with clients
- "Strategic Progress" — how are you tracking against objectives
- "Risks & Blockers" — what's slowing you down
- "Team & Capability" — staffing, skills, capacity
- "Cross-Team Needs" — where you need help from other leaders
- "General Update" — open-ended

When a leader selects a prompt, it guides their narrative. Emily can then filter the updates feed by prompt/topic to see all "Risks & Blockers" across every leader at once. This is incredibly powerful and directly addresses Steve's "against specific prompts/questions/topics" requirement.

### Deputy Experience:

When a deputy is logged in and viewing their assigned leader's page:
- Yellow banner at top: "You are updating on behalf of Irene Bletcher"
- All input fields (narrative, campaigns, action items) are editable
- Every submission is attributed: "by Sarah Chen (Deputy)"
- Q1 (financials) remains read-only — deputies don't touch financial data either
- Deputy can see everything the leader sees

---

## Screen 5: All Leaders Grid

**URL:** `/leaders`
**Purpose:** Browse and access any leader's strategy page

### Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ "All Leaders"                                                │
│ [Search: ___________] [Group: All ▾] [Status: All ▾]        │
│ [Sort: Name ▾]       [View: Grid | Table]                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Grid View (default):                                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐│
│  │ [AV]       │ │ [AV]       │ │ [AV]       │ │ [AV]      ││
│  │ I.Bletcher │ │ J.Park     │ │ R.Kumar    │ │ W.Zhang   ││
│  │ Americas   │ │ Banking    │ │ Workforce  │ │ APAC      ││
│  │ Market Lead│ │ Ind. Expert│ │ Offer Lead │ │ Mkt Lead  ││
│  │            │ │            │ │            │ │           ││
│  │ Rev: 83% █░│ │ Rev: 64% █░│ │ Rev: 91% █░│ │ Rev: 78% ││
│  │ Obj: 3/4   │ │ Obj: 2/5   │ │ Obj: 4/4   │ │ Obj: 2/3 ││
│  │ 🟡 Watch   │ │ 🔴 Risk    │ │ 🟢 Good    │ │ 🟡 Watch  ││
│  │ Updated 2d │ │ Updated 5d │ │ Updated 1d │ │ Upd. 18d ││
│  └────────────┘ └────────────┘ └────────────┘ └───────────┘│
│                                                               │
│  (... 30 total cards, 4 columns on desktop)                  │
│                                                               │
│  Table View (toggle):                                        │
│  Same data but as a sortable table with all leaders as rows  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

Cards are clickable → navigate to leader strategy page. Group filter highlights the relevant group tab. If a card shows "Updated: 18 days" it should have a subtle red border or staleness indicator.

---

## Screen 6: Strategy Map (Intersection View)

**URL:** `/strategy-map`
**Purpose:** Emily's "where do things intersect" view

### Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ "Strategy Intersection Map"                                  │
│ [Filter by theme: All ▾] [Filter by group: All ▾]           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  OPTION A: Matrix View                                       │
│                                                               │
│  A heatmap matrix where rows = leaders, columns = strategic  │
│  themes/tags. Cell color = intensity of involvement.         │
│                                                               │
│           │ GenAI │ FSI  │ APAC │ Workforce │ Methodology   │
│  ─────────│───────│──────│──────│───────────│───────────    │
│  Bletcher │ ██    │ ██   │ █    │ ███       │              │
│  Park     │ ███   │ ███  │      │           │ ██           │
│  Kumar    │ █     │      │      │ ███       │ ███          │
│  Zhang    │       │      │ ███  │ █         │              │
│  Patel    │ ██    │      │      │ ██        │ ███          │
│                                                               │
│  Where two leaders share a high-intensity theme, that's      │
│  an intersection. Click a cell → see detail panel.           │
│                                                               │
│  ─── OR ───                                                  │
│                                                               │
│  OPTION B: Network Graph                                     │
│                                                               │
│  Leaders as nodes, connections as edges.                     │
│  Edge thickness = # of shared tags/themes.                   │
│  Nodes colored by group. Hovering a node highlights          │
│  all its connections.                                         │
│                                                               │
│  (More visually impressive for demo but harder to read)      │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  INTERSECTION DETAIL PANEL (opens on click)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Connection: Irene Bletcher ↔ James Park               │  │
│  │ Shared Themes: GenAI, FSI                              │  │
│  │                                                        │  │
│  │ Bletcher's work:                                       │  │
│  │ • Campaign: "GenAI Talent Strategy for FSI" (60%)      │  │
│  │ • KR: "Launch assessment tool for 3 FSI clients"       │  │
│  │                                                        │  │
│  │ Park's work:                                           │  │
│  │ • Campaign: "Banking AI Methodology Development" (45%) │  │
│  │ • KR: "Publish GenAI readiness methodology v2"         │  │
│  │                                                        │  │
│  │ 💡 Suggested action: "Bletcher's Citi pilot depends    │  │
│  │    on Park's methodology. Coordinate timelines."       │  │
│  │                                                        │  │
│  │ Status: Identified  [Mark as Coordinating]             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Recommendation:** Build BOTH views and let the user toggle. The matrix is more functional for Emily's daily use. The network graph is more visually impressive for the demo with Carolee.

---

## Screen 7: Action Items Tracker

**URL:** `/action-items`
**Purpose:** Master view of all action items across the organization

### Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ "Action Items"                                               │
│ [Search: ___________] [Owner: All ▾] [Group: All ▾]         │
│ [Status: All ▾] [Source: All ▾] [Show: Overdue First ✓]     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  SUMMARY BAR                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 🔴 14     │ │ 🟡 47     │ │ ⬜ 23     │ │ ✅ 89     │       │
│  │ Overdue  │ │ In Prog  │ │ Open     │ │ Complete │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ☐ 🔴 Send revised pilot scope to Citi CHRO          │   │
│  │   Owner: I. Bletcher │ Due: Mar 20 │ OVERDUE 4 DAYS │   │
│  │   Source: Americas Cadence Meeting Mar 18             │   │
│  │   Linked: GenAI Advisory objective                    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ ☐ 🔴 Review APAC partner shortlist                   │   │
│  │   Owner: I. Bletcher │ Due: Mar 18 │ OVERDUE 6 DAYS │   │
│  │   Source: Manual                                      │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ ☐ 🟡 Finalize GenAI methodology v2 document         │   │
│  │   Owner: J. Park │ Due: Apr 5 │ In Progress          │   │
│  │   Source: Offering Leads Cadence Mar 15               │   │
│  │   Linked: GenAI Advisory objective                    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ ...                                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

Each action item row is expandable. Clicking the source link (e.g., "Americas Cadence Meeting Mar 18") could navigate to a meeting detail view showing how the action was extracted. Checkbox marks items as complete.

---

## Screen 8: Meeting Cadence View

**URL:** `/cadences`
**Purpose:** Show the operating rhythm and how meetings feed the system

### Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ "Operating Cadences"                                         │
│ [Group: All ▾]                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  CADENCE SCHEDULE                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Offering Leads       │ Weekly  │ Wednesdays 2pm ET   │   │
│  │ Market Leads          │ Biweekly│ Mondays 10am ET     │   │
│  │ Industry Experts      │ Monthly │ 1st Friday 3pm ET   │   │
│  │ Engines               │ Weekly  │ Thursdays 11am ET   │   │
│  │ Growth & Strategy     │ Biweekly│ Tuesdays 1pm ET     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  RECENT MEETINGS                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📋 Offering Leads Weekly — Mar 20, 2026              │   │
│  │    Status: ✅ Processed │ 6 action items extracted    │   │
│  │    Attendees: R. Kumar, L. Torres, M. Williams + 4   │   │
│  │    [View Notes] [View Action Items]                   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ 📋 Market Leads Biweekly — Mar 18, 2026              │   │
│  │    Status: ✅ Processed │ 4 action items extracted    │   │
│  │    Attendees: I. Bletcher, W. Zhang, A. Okafor + 3   │   │
│  │    [View Notes] [View Action Items]                   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ 📋 Industry Experts Monthly — Mar 7, 2026            │   │
│  │    Status: ⏳ Pending Review │ 8 items to confirm     │   │
│  │    Attendees: J. Park, S. Nakamura, D. Okonkwo + 5   │   │
│  │    [Review & Confirm →]                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  MEETING → ACTION ITEM PIPELINE (demo of AI extraction)      │
│  ┌────────────────────────┬─────────────────────────────┐   │
│  │ RAW MEETING NOTES      │ EXTRACTED ACTION ITEMS       │   │
│  │                        │                             │   │
│  │ [Paste or upload       │ AI extracts:                │   │
│  │  meeting transcript]   │                             │   │
│  │                        │ ☐ "Follow up with Citi"     │   │
│  │ "Irene mentioned that  │   Owner: I. Bletcher        │   │
│  │  Citi wants a pilot... │   Due: Mar 28               │   │
│  │  James said the        │   Topic: Client Development │   │
│  │  methodology needs     │                             │   │
│  │  two more weeks..."    │ ☐ "Finalize methodology"    │   │
│  │                        │   Owner: J. Park            │   │
│  │                        │   Due: Apr 5                │   │
│  │                        │   Topic: Offering Dev       │   │
│  │                        │                             │   │
│  │                        │ [Confirm All] [Edit] [Skip] │   │
│  └────────────────────────┴─────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

The "Meeting → Action Item Pipeline" is the money demo. Split screen: raw notes on left, AI-extracted structured items on right. User reviews and confirms. Items flow into the system.

---

## Screen 9: Content Hub (Phase 2 — Stub Only)

**URL:** `/content`
**Purpose:** Centralized content library for messaging consistency (Emily's second problem)

For the demo, just show:
- A grid of content cards with titles, categories, tags, last updated dates
- A search bar
- A "Coming Soon" banner explaining this will be the hub for strategic frameworks, playbooks, and enablement materials
- Maybe 5-6 mock content cards to give the idea

Don't build real functionality here — just show the vision.

---

## Mock Data Architecture — What to Generate

### Organizational Structure (generate first, everything references this):

```
GROUPS:
1. Offerings (what we sell)
   - Leaders: Raj Patel (Workforce Transformation), Lisa Torres (Leadership Advisory),
     Marcus Williams (HR Technology), Priya Sharma (Talent Strategy),
     David Chen (Change Management)

2. Markets (geographic)
   - Leaders: Irene Bletcher (Americas), Wei Zhang (APAC),
     Ahmed Hassan (EMEA), Carlos Mendez (LATAM),
     Sophie Laurent (UK & Ireland), Kenji Nakamura (Japan)

3. Industries (vertical expertise)
   - Leaders: James Park (Banking & Capital Markets), Diana Okonkwo (Health),
     Robert Kim (Public Service), Maria Santos (Resources),
     Tom Bradley (Communications & Media), Anika Gupta (Consumer Goods)

4. Engines (delivery)
   - Leaders: Michael O'Brien (Delivery Centers), Fatima Al-Rashid (Managed Services),
     Yuki Tanaka (Global Delivery Network)

5. Growth & Strategy (cross-cutting)
   - Leaders: Nina Kowalski (Partnerships & Alliances), Ryan Mitchell (Innovation),
     Sandra Obi (Go-to-Market)
```

That's 27 leaders. Close enough to 30 for the demo to feel real.

### Master Objectives (Carolee's top priorities):

```
1. "Establish GenAI talent advisory as the market-leading offering" — Target: Q4 FY26
2. "Expand presence and revenue in APAC and LATAM markets" — Target: Q3 FY26
3. "Drive 15% profitability improvement across all offerings" — Target: Q4 FY26
4. "Build and launch next-gen workforce planning capability" — Target: Q2 FY26
5. "Unify talent strategy messaging and methodology globally" — Target: Q3 FY26
6. "Increase client retention and expansion revenue by 20%" — Target: Q4 FY26
```

### Structured Metrics per leader (mock 27 rows):

For each leader, generate:
- Revenue target: $5M - $20M range (markets larger, engines smaller)
- Revenue actual: 60-95% of target (create realistic distribution)
- Pipeline: 1.2x - 2.5x coverage
- Win rate: 25-45%
- Profitability: 22-35%
- Chargeability: 80-92%
- Headcount: 40-200
- Open roles: 2-15

### Campaigns per leader (3-5 each, ~100 total):

Each campaign needs: name, type (Client Pursuit / Internal Program / Go-to-Market), status, priority, progress %, target date, tags, brief status narrative.

**KEY: Make tags overlap intentionally.** Multiple leaders should share tags like "GenAI", "FSI", "WorkforcePlanning", "APAC", "Methodology" — this is what powers the intersection detection.

### Key Results (2-4 per leader, ~80 total):

Each mapped to a master objective. Each with: description, progress %, status, start date, target date, 2-3 milestones.

### Narrative Updates (3-5 per leader, ~100 total):

Each with: date, author (leader or deputy), topic/prompt category, content (2-4 sentences), auto-tags, sentiment, linked objective.

**Vary the tone and detail level.** Some leaders write detailed updates. Some are terse. Some haven't updated in weeks (staleness). Some flag risks. Some are optimistic.

### Action Items (5-10 per leader, ~200 total):

Mix of meeting-extracted and manual. Some overdue, some complete. Each linked to a campaign or objective where relevant.

### Intersections (15-20):

Cross-reference leaders who share 2+ tags. Write a brief description and suggested action for each.

---

## Interaction Patterns

### Navigation:
- Sidebar is always visible
- Clicking any leader name anywhere in the app navigates to their strategy page
- Clicking any objective name navigates to that objective's detail (expanded on Emily's view)
- Breadcrumb trail at top: Dashboard > Leaders > Irene Bletcher
- Back button works naturally

### Filtering:
- Every list/grid has a group filter (the 5 groups)
- Every list has a status filter (On Track / At Risk / Behind / etc.)
- Search is available on All Leaders and Action Items views
- Filters persist within a session

### Data Entry (leader/deputy):
- Narrative updates: text input with topic selector, auto-tagging, objective linking
- Campaign status: click the campaign card → edit modal with status, progress slider, narrative update
- Action items: checkbox to complete, click to edit, [+ Add] button for new items
- All inputs show who submitted and when

### View Switching (Demo Feature):
- Dropdown at bottom of sidebar
- Switching persona triggers: different dashboard layout, different data emphasis, different edit permissions
- Smooth transition (maybe a brief loading state)
- This is the thing that will make Steve and Emily go "oh wow" — same data, completely different experience per role

---

## Responsive Behavior

- Desktop (>1200px): Full sidebar + 2-column quadrant layout
- Tablet (768-1200px): Collapsed sidebar (icons only) + quadrants stack 1-column
- Mobile: Hidden sidebar (hamburger menu) + single column scrolling

For the demo, optimize for desktop. Steve and Emily will be viewing on laptops in a Teams call.

---

## The Demo Script (How to Present This)

**Minute 0-1:** "Let me show you what this could look like."
Open as Carolee. Show the executive heatmap. "Carolee sees all 30 leaders at a glance. Green means on track, yellow means watch, red needs attention."

**Minute 1-3:** Click into a red leader (James Park). Show the four quadrants. "Revenue is tracking at 64% — that's from Steve's structured data. But look at Q4 — his latest narrative update explains why: the banking methodology is delayed. And look at Q3 — his APAC key result is behind."

**Minute 3-4:** Switch to Steve's view. "Steve, here's your operations lens. Same data, but focused on financials. Sortable table, pipeline scatter plot, revenue by group."

**Minute 4-6:** Switch to Emily's view. "Emily, here's yours. Master objectives progress — you can see GenAI is at 62% with 5 key results at risk. The narrative feed shows the latest updates from all leaders. And here's the Gantt timeline."

**Minute 6-7:** Open Strategy Map. "This is where it gets powerful. The system detected that Irene Bletcher and James Park are both working on GenAI in financial services but from different angles. Here's the suggested coordination action."

**Minute 7-8:** Show the Meeting Pipeline. "And here's how it all starts — meeting notes go in, action items come out, they flow into the right leader's page. Low burden, high value."

**Minute 8-9:** Switch to Deputy view. "Leaders can delegate. Their deputy logs in, sees the same page, updates on their behalf, and it's attributed correctly."

**Minute 9-10:** Questions and discussion about what data fields should actually populate each quadrant.
