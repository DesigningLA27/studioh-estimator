# Proposal builder — additions to `agreement-r1`

Reviewed: `https://studioh-billing-review.warwick-cca.workers.dev/assets/reviews/agreement-r1/`

**This is not a replacement.** The eight-step wizard and its contract mechanics are the right
spine and should be kept. What follows adds the half that is missing — the document — and
replaces placeholder pricing with Studio H's real rate sheet.

---

## 1 · What agreement-r1 already gets right · keep all of it

Steps: Start here · Fees & phases · Deliverables · Rates & expenses · Timing & invoices ·
Changes & notices · Cancellation · Review & apply.

The `ag` model covers the genuinely hard part of an agreement, and nothing below changes it:

- **Phases** — fee, method (fixed / hourly), duration with an optional range, invoice trigger
  (before commencement / after completion / monthly), net terms per phase.
- **Deliverables** — phase assignment, core vs optional grouping, fee / hours / cost, own
  duration and invoice trigger.
- **Deposit** — type, percentage, and how it is credited back.
- **Change rule** — "budget band exceeded" with a threshold, a new fee, a percentage, a flat
  change fee, and notice days.
- **Cancellation** — penalty type, percentage, what it is charged against, which phase.
- **Meeting allowance** and **mileage** with state and rate.

Steps 4–7 are the valuable part. Keep them exactly as they are.

---

## 2 · The gap: it produces a settings object, not a proposal

There is no document. A signed Studio H proposal is 15–19 pages and the wizard currently
produces none of it: no cover, no letter, no scope narrative, no milestones, no exclusions,
no reimbursables, no firm profile, no terms, no signature page.

**The fix is a second pane.** Build on the left, the actual document writes itself on the
right, with an `edit` affordance on every block. The document is the thing being made; the
wizard is how it gets made. Showing only the wizard hides the deliverable.

---

## 3 · Addition A · the document pane

Live preview, scrolls independently, updates as fields change. Section order, taken from the
signed proposals (Garibay 26012, Lundy 25055, Li 24025):

| # | Section | Source |
|---|---|---|
| 1 | Cover — client block, project address, **fee** | wizard |
| 2 | Letter — date, project no., "Re: X Residence" | template + merge |
| 3 | Process video | static, optional |
| 4 | Phase I scope narrative — tasks, **desired construction budget, design style, requested site elements** | wizard + project |
| 5 | **Pricing tables** — Design Phase / Construction Documents / Optional Items | wizard, auto |
| 6 | Phase II and III scope narrative, with the **construction cost cap** | wizard |
| 7 | Fees & options · commencement payment · cancellation worked example | wizard |
| 8 | Project milestones (10) | template, editable |
| 9 | Additional services + hourly rate schedule | wizard rates |
| 10 | Excluded services (10) | template, editable |
| 11 | Reimbursable expenses | template |
| 12 | Firm profile and key staff | studio settings |
| 13 | Our approach | template |
| 14 | Payment terms by phase | wizard |
| 15 | Contact | studio settings |
| 16 | **Terms and conditions (24 clauses)** | template, editable, merge-aware |
| 17 | Signature | PandaDoc |

Sections 8, 10, 13 and 16 are boilerplate today and should become **editable studio text**,
versioned, so a change applies to future proposals without touching signed ones.

---

## 4 · Addition B · real pricing · the 2024 rate sheet

Replace the placeholder rates (Principal 175 / Designer 125 / PM 150, budget 125k–175k,
percentage 12). The real schedule is **Principal $295 · Landscape Architect $250 ·
Designer $195 · Admin $100**.

Pricing is **a matrix: 8 construction-budget bands × 17 services.** The band selects the
column; every line item takes its price from that column. This is already how the signed
proposals price — Li (24025) at the 75–125k band matches the column exactly.

| Service | 0–50k | 50–75k | 75–125k | 125–175k | 175–250k | 250–350k | 350–500k | 500–750k |
|---|---|---|---|---|---|---|---|---|
| Conceptual Plan | 2595 | 2995 | 3495 | 3995 | 4495 | 5495 | 7995 | 9995 |
| Enhanced Conceptual Plan | 4595 | 5295 | 5895 | 6795 | 7995 | 9695 | 13395 | 15995 |
| Full CD Set · LC 1+, LG, LP, LL | 3395 | 3995 | 4995 | 6395 | 8895 | 11795 | 15095 | 17995 |
| Enhanced Concept CD Upgrade | 1895 | 2195 | 2995 | 4195 | 5995 | 8295 | 10595 | 12995 |
| Softscape Set · LP, LI, LL | 1995 | 2385 | 2795 | 3395 | 4395 | 5795 | 7595 | 8995 |
| DD Set · LP, LL, detail elevations | 1995 | 2495 | 2995 | 3795 | 5095 | 6595 | 8495 | 10195 |
| Construction Plan | 895 | 1095 | 1395 | 1795 | 2695 | 3495 | 3995 | 4695 |
| Construction Details | 1395 | 1795 | 2195 | 2895 | 3695 | 4795 | 6395 | 7995 |
| Rough Grading & Drainage Plan | 250 | 350 | 395 | 395 | 495 | 695 | 795 | 895 |
| Planting Plan, Details & Specs | 895 | 1095 | 1295 | 1595 | 2195 | 2895 | 3895 | 4595 |
| Lighting Plan | 295 | 395 | 450 | 495 | 695 | 795 | 795 | 795 |
| 3D Rendering · Lumion | 495 | 495 | 495 | 595 | 595 | 695 | 895 | 995 |
| Irrigation Plan, Details & Specs | 995 | 1095 | 1295 | 1595 | 1895 | 2495 | 3295 | 3995 |
| Pottery & Plants Plan | 395 | 395 | 495 | 495 | 595 | 595 | 695 | 795 |
| Furnishings Plan | 595 | 695 | 850 | 995 | 1095 | 1195 | 1395 | 1695 |
| Fuel Modification Plan | 795 | 995 | 1295 | 1495 | 1595 | 1795 | 1995 | 2395 |
| Water-Use Calcs · MWELO / WUCOLS | 495 | 695 | 895 | 1095 | 1295 | 1495 | 1695 | 1895 |

**Packaged "full service" price** (website, per band):
5,995 · 7,495 · 8,995 · 10,995 · 13,995 · 17,995 · 23,995 · 28,995.

**Bundle rules.** Full CD Set includes Construction Plan, Construction Details, Rough Grading
& Drainage, Planting Plan and Lighting Plan at a package discount — at 175–250k that is
$8,895 against $9,775 à la carte, a saving of $880. Enhanced Concept CD Upgrade includes the
same five and requires Enhanced Conceptual Plan. Model these as rules, not as hard-coded
totals.

**The band is chosen by the app, not typed.** The construction estimate already exists in the
project; it selects the column. Re-check it whenever the estimate changes.

**Fee as a share of construction is already in the sheet** and should be shown while pricing:
12.97% at 0–50k falling to 3.86% at 500–750k. A proposal far off the band's own ratio is
worth flagging before it is sent.

---

## 5 · Addition C · fee method as a choice at step 2

`ag.pricing` is currently fixed at `'Combination'`. Make it a real choice, because the
builder has to serve practices that do not price the way Studio H does:

1. **Budget band** (Studio H) — the matrix above. Default.
2. **Build your own** — the designer defines services, prices and phases and saves a reusable
   template. Each service prices by band, fixed, hourly, or percentage. Never open this from
   an empty state; start it from one of the other two.
3. **Percentage of construction** — the conventional method, with the standard phase split:
   schematic 20 · design development 20 · construction documents 40 · bidding 5 ·
   construction administration 15. Industry range is roughly 6–15% residential, scaling down
   as budgets rise. Also support lump sum, hourly not-to-exceed, and a multiple of direct
   personnel expense.

Worth surfacing the comparison: at $640,000 construction, 9.5% pays $60,800 where the band
model caps at $28,995. The bands stop at $750k — above that, percentage is the only method
that still works.

---

## 6 · Defects found in the signed proposals · fix in the builder

1. **Clause 17 merge field printed as "N/A"** on the signed Garibay agreement — the
   construction-cap clause went out unenforceable. **The builder must refuse to send with an
   empty cap**, and should warn when the cap is below the current estimate.
2. **Three different revision rates in one document** — $95/hr in the pricing block, $105/hr
   in the narrative, $150/hr elsewhere, against a $195–$295 schedule. One source of truth.
3. **"Effective January 1, 2015"** on the rate schedule. Should read from studio settings.
4. **Two different office addresses in one PDF** — 877 Francisco St in Contact, 960 W. 7th St
   in every footer. Studio settings, used everywhere.
5. **Discounts are in the text but not in the model** — 10% referral, and $1,000–$4,000 for
   signing with a preferred contractor. They belong in the fee calculation.

---

## 7 · Suggestions the app can make, because it knows the project

Offer, never auto-apply:

- Site in a Very High Fire Severity Zone → **Fuel Modification Plan**
- Over 2,500 sf rehabilitated with permits → **MWELO / WUCOLS calcs**
- Estimate crosses into the next band → **re-price, or raise the cap**
- Proposal ratio far from the band's own fee percentage → **say so before sending**

---

## 8 · Sending

Keep PandaDoc. The template is already a structured product catalogue with merge fields, and
it carries the signature, the audit trail and the legal defensibility. The builder fills it
through the API and stores what comes back — signed, which version, when, the executed PDF,
the agreed fee and **the construction cap**. That last field is what makes the Financials
Center real: it is the number clause 17 and clause 24 depend on, and nothing watches it today.

Keep the "upload a proposal written elsewhere" path regardless, for jobs done by hand.
