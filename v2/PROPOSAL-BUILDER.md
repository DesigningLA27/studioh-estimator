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

---

# Appendix · the standing text, transcribed from the signed proposals

Transcribed verbatim from Garibay 26012 (Jun 2026), Lundy 25055 (Nov 2025) and Li 24025
(Apr 2024). Codex cannot write this; it has to be carried across. Every block below becomes
**editable studio text, versioned**, so an edit applies to future proposals and never to one
already signed. Merge fields are marked `{{ }}`.

## A · Phase I — Landscape Conceptual Plan · ({{weeks}}) Weeks

> **Task One:** Design Consultation (Completed) — Initial direction-setting meeting to discuss
> the scope and Owner's preferences.
> **Task Two:** Obtain base and floor plan from the Client indicating lot lines, building
> envelope, elevations, and residential footprint to facilitate an accurate base map.
> **Task Three:** Prepare a Conceptual Estimate of Probable Construction Costs. *(Client
> Meeting #1 — Online Slack Meeting)*
> **Task Four:** Based on site opportunities and constraints, prepare a B/W Preliminary
> Landscape Plan with color reference images, suitable for Client review. Plans will be
> prepared to scale in AutoCAD. Present Conceptual Plan and conduct a coordination/study
> session with the Client to solicit comments. 3D Rendering is included with all "Enhanced
> Conceptual Plans and Full Construction Sets". *(Client Meeting #2 — Online Slack Meeting)*
>
> The Landscape Concept Plan will include:
> - Layout hardscape, planting areas and design elements
> - Consider views, prevailing winds, privacy, and sun/shade, and interior views
> - Client desired construction budget of **{{budget}}**
> - Consider **{{design_style}}** design style
> - Requested site elements to include, but not limited to: **{{site_elements}}**
>
> Any revisions to the 3D Rendering will be at a discounted hourly rate of
> **{{render_revision_rate}}**. Conceptual Plan includes (1) one revision. More than 1 major
> revision will be billed at our Hourly Rates upon approval by Client of the estimated hours.
>
> Small revisions can take 2–7 days and redesigns can take up to 2–3 weeks. Please keep in
> mind that this timeline varies due to change of project scope, client responsiveness and
> other unforeseen factors. We will do our best to meet these deadlines and deliver an awesome
> design you will be happy with.
>
> **Note:** Studio H services will commence upon receipt of payment, a signed agreement, the
> completed questionnaire, either a Plot Plan or site measurement and upon approval of the
> preliminary cost estimate.

## B · Phase II — Landscape Construction Documents ({{weeks}} — Varies with options selected)

> **Task One:** Prepare the following Construction Documents on AutoCad for Client approvals,
> contractor bid purposes and installation. All work related to the city including submittals
> and revisions will be billed hourly (upon request).
>
> **Note:** Fees are based on a maximum landscape construction cost of **{{cap}}** and are
> subject to increase if the costs exceed **{{cap}}**. Should the scope exceed the limit
> Studio H will invoice the Client for the difference in cost prior to commencement of
> Phase II.
>
> **Final Construction Documents:** The set shall include the following plans @ 1/4" or
> 1/8" = 1'0" scale
> - Construction Plan w/ Finish Schedule — scaled plans w/ materials & finishes
> - Construction Details & Specifications — custom details as required for building
> - Planting Plan, Details & Specifications — plant locations, size, species & qty.
> - Low Voltage Landscape Lighting Plan — locate and specify fixtures & specs.
> - Rough Grading & Drainage Plan — spot elevations, drainage flows & inlets
>
> **Task Two:** Attend coordination/study session with the Client to solicit comments.
> *(Client Meeting #3 — Online screen-share, On-site optional, billed hourly)*
> **Task Three:** Revise plans as required.
> **Task Four:** Request 1–3 Contractor bids. *(as requested by client)*
> **Task Five:** Adjust final finish materials after Contractor bids. *(if requested)*

## C · Phase III — Landscape Construction Observation (Optional)

> **Task One:** Attend construction site meetings/visits at the request of the Client and/or
> Contractor to review the plans with the preferred subcontractors, establish guidelines for
> product and installation review and approvals and assist in field questions/revisions.
>
> **Task Two:** On approval from the Owner conduct scheduled construction observation visits.
> Minimum Observation Schedule (as approved by the Owner):
> 1. Approved hardscape layout and review concrete finish samples
> 2. Specimen tree spotting and shrub inspection
> 3. Pre-punch list prior finish
> 4. Final walk-through at completion of construction and planting
> 5. Final Sign-off (at completion of final punch list)
>
> LANDSCAPE CONSTRUCTION OBSERVATION (As Required) — **$Hourly**

## D · Fees & options · commencement payment

> Our fee for seeing the project through from start to completion will be the total amount of
> selected items, plus/minus any increase/decrease in fee due to construction cost budget
> changes above the maximum of **{{cap}}**. In addition to this you should also budget
> approximately **{{reprographics}}** +/- for reprographics costs, which the Client agrees to
> pay the reprographics vendor direct.
>
> **COMMENCEMENT PAYMENT:** {{commencement_terms}}
>
> Should the contract be terminated by the Client, Studio H will charge the Client for the
> completed hours of labor at our stated Hourly Rates or the percentage complete of the phase,
> whichever is greater, plus a **30% Cancellation Fee** for the remaining balance of the
> contract. *Example: The contract amount is $12,000, 20 hours completed at an average rate of
> $250/hour = $5,000, the contract balance equals $7,000. The Cancellation Fee is $5,000 + 30%
> of $7,000 = $7,100.*
>
> All invoices will be sent via an Intuit online invoice which requires a simple setup for the
> first payment and subsequent payments will be as easy as logging in. Your bank account and
> routing number will be required by Intuit, we will never see this information. Credit card
> payments are not accepted.

**Two commencement variants in use.** Concept-led: *"broken into two payments… first payment
is full payment of Phase I (Conceptual Design) plus 30% selection optional items, and the
second payment is the remaining 70% of optional items."* CD-only: *"The fee of the selected
items for construction documents only are due upon commencement. The first payment is the
full payment of all construction documents and optional items."* Make this a selectable rule.

## E · Project milestones (10)

> Milestones may or may not follow the below sequence.
> 1. **Approval of preliminary estimate of construction costs** — For budget conscious projects
>    we will prepare an Excel spreadsheet outlining the probable construction costs prior to
>    commencing design.
> 2. **Presentation of Conceptual Landscape Plan & construction costs** — Online Slack
>    Screen-share presentation
> 3. **Revised Conceptual Plan for Client approval** — Revisions will be completed and
>    presented via Slack Screen-share
> 4. **Commencement of Construction Documents (Phase II), if selected** — Autocad construction
>    documentation and/or optional items will commence.
> 5. **Submittal / Approval of plant material list** — A list of recommended trees and shrubs
>    will be submitted to Client for approval
> 6. **Submittal of 100% Construction Documents for client approval & comments** — Submit
>    completed Phase II/Options plans to Client for comment, review, & revisions.
> 7. **Plot and deliver Construction Documents for client submittal to HOA (if requested)** —
>    Multiple sets will be sent to Client for HOA approvals
> 8. **Send plans to Landscape Contractors for bidding** — We will send the digital plans to
>    preferred Contractors for bidding, upon request.
> 9. **Review Landscape Contractor bids with Client & select Contractor** — Review and compare
>    Contractor bids for completeness and accuracy and make recommendations to Client.
> 10. **Construction Observation services as requested by the Client** — Services include site
>    visits, minor revisions to plans, furnishing and pottery recommendations, invoice and
>    change order review, and final inspection and punch list.
>
> **Note:** Studio H services will commence upon receipt of payment, a signed agreement, the
> completed questionnaire, either a Plot Plan along with a first floor elevation from the HOA
> documents or a site measurement/survey, and approval of the preliminary cost estimate.

*(A CD-only proposal drops milestones 2 and 3 and renumbers.)*

## F · Additional services

> 1. At the Client's express request, Studio H will provide any or all of the following
>    additional services: Make revisions to plans and application previously prepared by
>    Studio H where such requests are inconsistent with prior Client approvals due to
>    substantial changes in Client's instructions. Services are to be billed the hourly rates
>    identified herein.
> 2. Following is a current schedule of rates charged by Studio H for authorized extra work or
>    services contracted on an hourly (time and materials) basis, effective
>    **{{rates_effective_date}}**.

**Schedule of hourly rates** — Principal $295 · Landscape Architect $250 · Designer $195 ·
Admin Staff $100. *(Currently hard-coded as "effective January 1, 2015". Read from studio
settings.)*

## G · Excluded services & notes (10)

> Studio H will have no involvement in other aspects of the project and in particular Studio H:
> 1. Will not provide any soils engineering services whatsoever, nor otherwise have any
>    liability or responsibility for the project's soils and/or subsurface conditions.
> 2. Will not be responsible for the accuracy of data and other work provided to Studio H.
> 3. Will not be responsible for any structural specifications for structures.
> 4. Engineering, Pool Construction Details & Plumbing, Mechanical and Electrical by others.
> 5. Studio H will not provide site measurements or a site survey
> 6. Services for City Submittals are not included in this fee proposal
> 7. DRC/HOA and City Submittal fees are not included.
> 8. No engineering services are included.
> 9. Studio H can not guarantee projects will be within Client's budgets as Contractor pricing
>    varies.
> 10. We do not guarantee the timeliness, completion or quantity of Contractor bids as they are
>    independent companies out of our control.

## H · Reimbursable expenses

> All project related reimbursable expenses including black and white plotting, will be billed
> at cost. HOA/DRC fees are not included. Estimated reprographics and delivery expenses are
> estimated at **{{reprographics}}** and are to be paid directly by the Client. A credit card
> will need to be put on file with ARC, a large reprographics company throughout Southern
> California.

## I · Payment terms · discounts · compensation disclosure

> **PHASE I:** Conceptual Design and 30% Construction Documents: + 30% cost of additional
> services, if selected. Paid prior to commencement of phase I.
> **PHASE II:** 100% Construction Documents/Optional Items (if selected): + 70% cost of
> additional services, if selected. Paid prior to commencement of phase II.
> **REPROGRAPHICS** — Estimate {{reprographics}}. Studio H will assist the Client to add a
> credit card on file at ARC.
> **PHASE III:** Construction Observation.
>
> **DISCOUNTS:** Studio H does offer discounts or payment for new client referrals. Payments /
> discounts are given at the conclusion of the referred project. A referral discount/fee is
> paid in the amount of **10%**. Studio H also offers discounted design fees at commencement
> with the signed agreement with a preferred landscape contractor. This discount can range
> from **$1,000 – $4,000**.
>
> **IMPORTANT NOTE:** Studio H may receive compensation for goods purchased on the client's
> behalf. Goods may include, but are not limited to; landscape lighting, furniture, and
> pottery. The client is welcome to decline purchasing products and additional services
> through Studio H.

*(The referral and preferred-contractor discounts are in the text but absent from the fee
model. They belong in the calculation.)*

## J · Firm profile · our approach

> **FIRM'S PROFILE** — Studio H Landscape Architecture is a leading firm in Southern California
> specializing in customer-oriented design and project-management to make your dream home and
> garden a reality. Studio H has unique expertise in the areas of both new builds and home
> renovations and has been operating since **2007**. Studio H has assisted hundreds of clients
> across multiple industries including private clients, local government and schools as well as
> major state and national businesses.
>
> **KEY STAFF** — Warwick Hunt, Principal ASLA · Mina Roades, RLA #5456 · Ryan Kieta,
> Landscape Architect · Ben Mortella, Landscape Architect · Natalie Seiden, Admin
>
> **OUR APPROACH** — We believe that each client is unique and so we take a unique approach to
> each project. In this case we have noted and analyze your requirements as well as undertaking
> a thorough review of the site including a feasibility analysis and a detailed costing and
> modeling of the whole project. Drawing on our long experience in this area we have tailored a
> solution to your exact specifications by fusing form and function to create the ideal space
> for you. In practical terms we have also identified and outlined key strategic milestones in
> the life of the project to ensure a smooth completion as well as accountability throughout
> all stages of the project.

Staff list belongs in studio settings, with headshots — it changes more often than the rest.

## K · Terms and conditions — all 24 clauses

> The following terms and conditions shall form the basis of a contract between
> **{{client_name}}** ("Client") and Studio H Landscape Architecture ("Firm") in the event that
> the client decides to proceed and accepts this proposal:
>
> 1. The Firm agrees to provide the services outlined in this proposal for the fee outlined above.
> 2. The Client undertakes to pay the fee set out above in accordance with the agreed payment milestones.
> 3. The Firm undertakes to consult with the Client in order to facilitate the completion of the agreed milestones above as well as the completion of the project as a whole.
> 4. The Client undertakes to provide the Firm with clear instructions and guidance when required.
> 5. The Client agrees to pay a **1.5%/month** late charge for all past-due invoices. **Net 7** standard terms.
> 6. The Firm may outsource work or manage contractors.
> 7. The Client undertakes not to withhold payment for any reason. Projects will be put on hold due to non-payment and cancelled for non-payment exceeding (21) twenty-one days. Penalty fees may apply.
> 8. Any subsequent agreement, whether written or oral, between the Firm and the Client shall not override the terms of this architectural proposal.
> 9. The Firm is not responsible for delays due to outside agencies such as planning or government authorities, builders' merchants, shipping and transit companies and third-party contractors.
> 10. The Firm is not responsible for delays due to unforeseen eventualities or Client response times.
> 11. The Firm may terminate the contract at anytime due to non-payment and the balance of services completed will be due immediately.
> 12. Although every care has been taken in the preparation of this proposal it is not possible to predict with complete certainty the timescale of any architectural project and the Client should allow at least a **25%** margin on timescales.
> 13. The Client agrees to provide the Firm documentation required to complete the services.
> 14. The Firm may terminate the contract at anytime due to unethical Client behavior and poor treatment of its staff and the balance due for completed services at our standard Hourly Rates will become payable immediately.
> 15. Studio H has the right to place a project on hold for past due invoices.
> 16. Studio H has the right to cancel projects for past due invoices of more than (14) fourteen days. Any remaining balance will become due and payable immediately.
> 17. The Client agrees to pay the Add Service fee if the project's Landscape Construction budget increases over the maximum allowable **{{cap}}**. The "Landscape Construction Budget" will be based on In-House excel estimates derived from our preferred landscape contractor.
> 18. If a project is to be delayed by the Client in excess of (60) days Studio H has the right to terminate the agreement at that time, or charge an additional fee, to total no more than the current rates, at which time the project commences again. If the agreement is terminated the balance due for work completed will be due/returned within (14) days. There will be a **30%** cancellation fee on any un-billed portion of the agreement. If the Client and Studio H decide to mutually continue the 30% fee will be applied as a credit moving forward.
> 19. Studio H will not be responsible for Construction Cost increases due to project delays and/or holds. Should the Client require revisions due to these increases, all revisions will be on an hourly rate, as noted in this Contract.
> 20. This proposal must be signed within (21) twenty-one calendar days from proposal date.
> 21. Studio H has the right to terminate the agreement if the client demonstrates a willful refusal to abide by contractual obligations and attempts to claim benefits that are not delineated in the agreement.
> 22. Due to the wide range in pricing / quality of craftsmanship between contractors we do not guarantee that the contractor bids will be equal to our in-house estimates of probable construction costs. Studio H will gladly make revisions to final plans if the plans are more than **10%** over a Studio H preferred Contractor bid.
> 23. Studio H does not guarantee that our plans meet all City requirements as City ordinances change frequently. Additionally, it is common that City employees will be unaware of all the codes and will present the wrong information.
> 24. The Client understands that the Studio H fees, and add services, are based on in-house estimates and that our design fees are subject to change (increase or decrease) based on these estimates. After completion of the plans, if a Studio H preferred Contractor bids the plans, as completed, at a price point which is either less or more than the contracted budget range for our design services then the Client will either receive a refund for the difference, or pay an additional fee for the design services.
>
> **Signed as accepted by {{client_name}}** — Date: {{date}} — Mina Roades, RLA #5456

## L · The clauses the app can actually enforce

Clauses 17, 22 and 24 all turn on the **in-house construction estimate**, which this app
produces. They are live mechanics, not boilerplate:

- **17** — fee increases if the construction budget exceeds `{{cap}}`. The app knows the
  estimate and the cap; it can raise this the day it happens.
- **22** — Studio H revises the plans free if they come in **more than 10% over** a preferred
  contractor's bid. Bid Compare holds both numbers.
- **24** — the fee adjusts up *or down* against the final contractor bid. Also computable.

Today nothing watches any of them, so they are enforced only when someone remembers. Wiring
these three is the strongest argument for the proposal and the estimate living in one app.

## M · Numbers that currently vary and should come from one place

| Value | Seen as | Belongs in |
|---|---|---|
| Rate schedule effective date | "January 1, 2015" | studio settings |
| 3D revision rate | $95/hr · $105/hr · $150/hr | one field |
| Office address | 877 Francisco St · 960 W. 7th St | studio settings |
| Reprographics estimate | $250 | studio settings |
| Late charge · terms | 1.5%/month · Net 7 | studio settings |
| Cancellation fee | 30% | fee model |
| Signature window | 21 days | fee model |
| Referral discount | 10% | fee model |
| Preferred-contractor discount | $1,000–$4,000 | fee model |
