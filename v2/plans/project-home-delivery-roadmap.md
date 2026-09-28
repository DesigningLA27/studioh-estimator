# Project Home and delivery planning

Requested by Warwick on September 28, 2026. This is implementation work to follow mockup approval. None of the scheduling, email, AI, assignment, or role demonstrations in the study should be described as live integrations.

## Home requirements

Keep the project name prominent and switching easy. Prioritize current status, what is next, milestone countdown, approvals, landscape budget variance, and design-fee performance. Site dimensions belong in Project info, not the urgent Home summary. Offer Project shortcuts to the estimate, questionnaire, moodboard, reports, plans, and files. Project Files is a filtered view of the existing file store, showing current revisions and owners, not a second storage system.

- Principal/admin: studio capacity, commitments, cost-to-complete, projected profitability, approvals, assigned tasks, bids and estimate health.
- Staff: own tasks, blockers, dependencies, remaining effort, assigned delivery work, and permitted project information.
- Client: committed milestones, issued deliverables, own decisions, approved budget information, and client-visible activity. Internal labor costs, rates, profit and staff workload are excluded by server authorization, not merely hidden controls.
- Card preferences are per user/role. Identity and critical status remain visible. Savings appear when above budget; upgrade suggestions only below budget after allowing for contingency. Bids appear only if bid records exist.

## Build order

### 1. Source-of-truth task roadmap

Create an editable studio template with project-specific task instances. Use explicit records, not an AI-generated percentage. Each task has stable identity, phase, description, assignee, estimated and actual hours, predecessors, completion criteria, evidence/attachments, approval requirements, deadline type, blocking reason, status and audit history. Version templates; never overwrite a project's customized tasks when updating a template.

| Phase | Initial task families | Completion evidence |
|---|---|---|
| Discovery | Project identity, agreed scope, client brief, site records, constraints, budget, fee proposal | Reviewed brief, scope/fee acceptance, verified site inputs |
| Concept | Options, spatial concept, palette, preliminary quantities, cost review, client decisions | Saved concept revision, reviewed estimate, recorded approvals |
| Design development | Coordinated plans, planting, lighting, materials, furnishing selections, quantities, specification choices | Coordinated drawings and schedules, unresolved-items list |
| Documentation | Detailed plans, specifications, consultant coordination, quality review, issue package | Checked revision and issue record |
| Bidding | Invitation package, incoming bids, exclusions/allowances review, comparison, recommendation | Bid records and documented comparison |
| Delivery / closeout | Final issue, handover documents, archived revisions, outstanding decisions | Issued deliverables and completion record |

The families above are the initial specification, not a universal mandated workflow. Staff should adapt tasks to project type, scope and responsibilities. Keep incomplete tasks visible even after a phase changes. Distinguish phase selection from task completion and client approval. Any AI-generated task must be reviewable and traceable to the template or identified project requirement.

### 2. Staff assignments and capacity

Use authenticated staff identities, roles, availability, working hours, holidays, leave, and allocations across all projects. Calculate available capacity after other commitments. Permit assignment and reassignment with a clear effect on workload. Differentiate labor hours from elapsed waiting time and calendar duration. Show unassigned work and missing estimates explicitly. Load rates and financial cost access are principal/admin only.

### 3. Milestone builder and scheduling

At kickoff, accept milestone title, owner, deliverable, predecessor tasks, desired exact date or duration window (e.g. 2–4 weeks), and fixed/flexible setting. Use the actual project kickoff date and a chosen working calendar. Keep original baseline, current committed deadline, and latest forecast separately.

- Finish ASAP: schedule at the earliest feasible staffed slot after prerequisites.
- Spread to deadline: distribute work over available slots without violating dependencies or fixed commitments.
- Estimate earliest/latest feasible completion, capacity gaps, and confidence or missing-input warnings.
- A flexible target may move according to the user's approved auto-rescheduling preference. Show a change preview and audit record. Do not silently change externally committed dates or notify clients.
- A fixed deadline never moves automatically. Flag insufficient capacity and suggest options: reassignment, reduced scope, or a revised commitment for approval.
- Relative windows do not become falsely precise dates until enough inputs exist. Recalculate on effort, availability, assignment or dependency changes.

Acceptance examples: staffing on another project reduces available hours here; a prerequisite approval prevents dependent scheduling; a Friday deadline with insufficient capacity produces risk rather than hidden overtime; changing ASAP/spread preserves total work and dependencies; multiple flexible windows respect order.

### 4. Approvals, project holds, and health

Approval records need requested recipient, date, required-by date, affected tasks, supporting revision, response and evidence. A hold identifies scope, reason, start date, owner and unblocking event. Continue independent tasks where possible.

- Green/on target: forecast fits the commitment and no critical blocker threatens it.
- Amber/at risk: forecast capacity gap, unresolved critical dependency, or predicted lateness.
- Red/past due: a committed date passed without the corresponding completion record.
- On hold: explicit blocking state; preserve the deadline/overdue signal alongside it instead of hiding it.

Use text and symbols as well as color. When a hold ends, recompute affected downstream work using business-day calendars. Shift only eligible flexible milestones; flag fixed commitments. Record who confirmed changed dates. Email silence alone cannot establish a hold or approval.

### 5. Financial summaries

Landscape card: current budget, calculated estimate, currency, over/under amount and percent, cost snapshot time, and savings/upgrades action. Savings calculations run on a copy of the estimate with quantities, scope, exclusions and design impact visible; overlapping opportunities cannot be summed as certain savings. Protect client priorities and locked scope.

Design-fee card: agreed fee, costs incurred, remaining cost forecast, projected total cost, projected profit and margin. Include loaded labor and defined project expenses. Link to time/expense detail. Keep invoiced/paid/receivable concepts separate from profitability. Missing rates or remaining effort make a forecast incomplete, not zero. A construction estimate overrun alone is not justification for a design-fee change order; an actual services/scope change is required.

### 6. Grounded AI project brief and next actions

First provide a deterministic project summary and priority queue from explicit records. Then add AI wording and recommendations with permitted source records, calculation outputs, recency, and links. Cover delivery risk, blockers, budget/fee health, and the next useful action. Do not invent progress, cost savings, approved scope, staffing capacity, or activity. Flag missing/stale data. Recompute only when meaningful source records change, not on every page render. Principal, staff, and client prompts receive different authorized data sets.

### 7. Communication and activity

Connect email via the website's own authorized account integration. Start with metadata-only scope where supported: message direction, timestamp, sender/recipient, subject/thread reference as allowed, project match, and freshness. Content access is optional and separate. Let the user review project matching and correct it. No automated sending is implied by connection. Respect account disconnection, access controls and retention settings.

Activity should use actual recorded events: file revision, time/task update, estimate change, milestone adjustment, client response, and email metadata. Link events to their source. Display who changed what and when. Keep external email events distinct from app approvals and task status.

## Integration and release checks

Depends on authenticated staff/client accounts and project access rules; a preview role selector is not authorization. Use existing Cloudflare records for persistence, existing financial calculations for amounts, existing Project Files for revisions, and one project identity throughout. Do not introduce another browser-only project store.

Test two different projects to prove Home switches all data; unfinished prior-phase work; no-data states; below/above/at-budget cases; fixed/flexible deadlines; holds across weekends; invalid dependencies; overallocated staff; email disconnect/stale state; role authorization; and refresh persistence. Verify Home remains fast: load a small summary before heavy tool modules, and avoid downloading complete libraries for dashboard numbers.

## Mockup round two

`v2/mockups/project-home-r2/` contains D: Project pulse, E: Delivery planner, F: Studio briefing. Only project identity, address and the $450,000 sample budget are grounded in the built-in sample definition. All schedule, staff, counts, activity, estimate/fee/bid figures, savings and AI prose are explicitly illustrative. The preview week is September 28, 2026. Controls are in-memory demonstrations and do not persist or send anything.

## Visual refinement — September 28, round three

Use a project cover image and a small default selection of cards. Align cards in shared grid rows; avoid uneven independent columns. Keep the page calm and consistent with Studio H: white, existing green, and restrained blush or powder-blue accents. Offer more cards through customization, rather than showing everything by default. Project shortcuts can use simple text links.

- Delivery-risk alerts: user-controlled enablement, immediate/daily/weekly timing, dismissal, and a settings entry for restoring them. Store per-user preferences; notification scheduling remains future work. Dismissal must not erase actual milestone or risk records.
- Brief: optional swipeable text and accessible diagrams with actual source values, keyboard/arrow alternatives, no automatic rotation.
- Milestone: countdown color thresholds with readable text, and a swipeable remaining-task view.
- Quick approval: record the designer acknowledging an approval, with identity, timestamp, exact selection/revision, optional evidence and an undo/correction history. A checkbox is not a client signature.

`v2/mockups/project-home-r3/` offers G: The gallery, H: The studio journal, and I: The quiet workspace. Controls and values are illustrative, in-memory previews only.
