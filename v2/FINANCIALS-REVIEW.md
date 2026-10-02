# Financials page — review three alternative directions

## Context

The current mockup set is `finance-r4` (five directions, a–e). Review it against the three
alternatives below and come back with a recommendation.

**The problem with r4 as it stands:** the five directions are the same blocks reordered —
`hero + band + metrics + phases + trend/insight/deliverables`. They are five arrangements of
one idea, not five answers. And the page is dominated by a single mechanic, the
construction-value fee band, which is one question out of about seven a principal asks. Its
tabs (Overview / Fee alignment / Deliverables / Forecast) are filing-cabinet labels: you have
to already know which drawer the answer is in before you can ask.

All three alternatives use the same demo data as r4 so they compare directly:
fee $36,000 · construction estimate $214,000 (was $187,000 at signing) · forecast direct cost
$18,000 · 245 of 390 hours used.

---

## Direction 1 — The four questions

Tabs stop being topics and become the four questions a principal actually asks.

- **Am I making money?** — contracted fee (and which version is signed), cost to date broken
  into labour / 1099 / reimbursables, profit $ and margin %, effective rate (fee ÷ hours),
  margin by phase, and the full deliverable table with hours used, cost and margin per row.
- **Will I?** — hours used vs planned per phase, forecast at completion, forecast margin vs
  margin at proposal, burn rate and weeks of fee remaining, phases over and under by name.
- **Have I been paid?** — payment schedule by milestone (due / invoiced / paid), invoiced vs
  collected vs outstanding with 30/60/90 ageing, unbilled work.
- **Was the fee right?** — fee as % of construction value, fee per SF designed, construction
  value drift since signing, this fee against past projects of similar size and scope.

**Trade-off:** some data belongs under two questions — hours are both "making money" and
"will I". Either accept the duplication or the tabs start lying.

## Direction 2 — One screen, no tabs

A principal checks the money in thirty seconds, not by browsing. Everything that matters on
one page; detail one click deeper.

Layout: an AI summary panel at the top that reads the whole picture in three sentences → a
five-tile strip (fee, cost to date with % of hours used, forecast margin vs margin at
proposal, outstanding with oldest age, fee ÷ construction value) → three cards (payments,
hours by person, outside the fee) → the deliverable table.

**Trade-off:** dense, and it only stays readable while the studio is small. It is also the
only layout where the AI can read the whole picture, because nothing is hidden in another tab.

## Direction 3 — The money over time

The spine is the project's financial life: signed → each phase → each invoice → completion.
A horizontal timeline shows fee earned and cost incurred on the same axis, solid for recorded
and faded for forecast, with each milestone marked paid / outstanding / not due.

Below it: "what changed, and when" (signed, invoiced, estimate grew, invoiced again) and
"where the hours went, week by week".

**Trade-off:** hardest to build, and it needs dates, which nothing in the app carries yet.
Weaker than the other two for "which deliverable is bleeding". Strongest for showing a job
going sideways, because that is a shape over time.

---

## Two things in the existing demo data that none of the r4 directions surfaces

1. **Client coordination carries no fee and has run 124 hours against an 86-hour allowance.**
   At the blended rate that is $1,310 being absorbed, and it is the only line on the job
   losing money. In r4 it is four clicks down a table; it should be on the first screen. In
   direction 3 you can also see *why*: coordination was 14% of hours in weeks 1–4 and 51% in
   weeks 9–11.

2. **The construction estimate moved $187k → $214k after signing, crossing the next fee band,
   and the fee has not moved.** r4 has the band mechanic but presents it as a chart to study.
   It should be a sentence: five weeks of work has been done at the old band.

---

## Rules any direction must follow

- Build with existing V2 components only: `.w-hero`, `.w-metrics`, `.w-card`, `.w-grid`,
  `.w-list`, `.w-line`, `.phase-path`, `.w-progress`, `.pill`, `.action`, `.quiet`.
  Tokens: `--paper --white --ink --muted --sage --green --on`.
- The estimate is what the CLIENT pays the CONTRACTOR. Financials is what STUDIO H earns
  designing it. Two ledgers — and this app is the only place that holds both, which is what
  makes "was the fee right?" possible at all.
- Every figure comes from entered data or the engine. If an input is missing, the card says
  what is missing rather than showing a placeholder.
- Internal cost rates, margin and profit must be **absent** from any client payload, not
  merely hidden.
- State on the card whether cost rates include employment burden and overhead. In the demo
  they do not, so 73% margin is not the real margin — saying so on the card stops every
  number above it quietly flattering the result.
- Any AI text is handed engine facts and writes sentences. It never produces a figure.

## What to come back with

1. Which direction, or which merge of them, and why.
2. Anything in r4 worth keeping that the three above drop.
3. What has to exist before it is real. The three known gaps: time entry (per phase, optional
   task detail), the signed proposal as the source of scope and payment schedule, and
   cost/billable rates per role with the burden question answered.
