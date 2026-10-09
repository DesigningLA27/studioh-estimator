# Studio H pending work

Update this list at each release. Raise a dependency when the current feature needs it. Do not treat a mockup as a completed integration.

- [ ] Authenticated user accounts and project access rules. Needed before customer invitations, private shared files, or customer cloud saves. Developer/Designer/Customer switches currently preview UI; they are not authorization.
- [x] Cloudflare V2 write-back and private media storage connected in V2.049 for authenticated studio-admin use. Uploaded files allow up to 50 MB each; individual account sharing remains pending.
- [ ] Register/connect Studio H's Dropbox app and choose project folder. Needed before Dropbox imports and folder sync. Codex's Dropbox connection does not authorize the website.
- [ ] AI document extraction and source review: address, HOA, proposals/fees, plans. Depends on account-bound storage and Dropbox/upload sources. Preserve source/page and require review of conflicting project values.
- [ ] DWG conversion. Native tracer accepts PDF and supported DXF entities; DWG needs PDF export or a conversion service. Do not advertise direct DWG tracing as working.
- [ ] More complex DXF support. Current import handles lines, straight polylines, circles and arcs; unsupported drawing content needs PDF export.
- [x] Satellite trace thumbnail: show a genuine current map/trace preview in Programming. Never substitute an unrelated demo or screenshots as editable trace data.

## Current correction (V2.026)
- Existing Cloudflare project list confirmed: SAMPLE DEMO and Nest Pine are present.
- SAMPLE DEMO contains 16 saved polygons and a live satellite base.
- Connect Sample Demo to that saved record and the unchanged V1 tracer, replacing the fabricated PDF example.
- Enable only map service requests inside the tracer; keep production project writes blocked.
- Add JPG/PNG bases through the same tracer.
- Project picker redesign remains a choice among mockups until approved.

- [ ] Connect the tracer’s “Design the garden” AI request in V2. V1 siteAsk uses the AI service to propose elements and the existing placement solver/tray. V2 currently blocks that request. Needed when enabling AI layout generation inside the tracer; preserve review/place/apply behavior. This is separate from document extraction and photo rendering.

## Compatibility follow-up
- [ ] Check Google Maps iframe compatibility on iPad Safari: Chrome renders the real map, zooms and reopens correctly, but Google's map library logs a cross-frame listener warning in the opaque iframe. Keep the production-write boundary; do not remove the sandbox just to silence a warning.

## Verification
Real SAMPLE DEMO read from Cloudflare: 16 shapes, live satellite base, 14,204 SF displayed. Zoom, close, saved reload and real satellite thumbnail verified. PDF/DXF existing tests passed; JPG base opens the same tracer. Root V1 source unchanged. Popup mockups: clear list, visual cards, focused chooser.

## Moodboard release V2.029
- [x] Three approved moodboard views built over the original project selections, switchable within the actual board.
- [x] Connect Add to Moodboard from V2 Plant Book/material/furnishing records and palette selection. Keep native quantity/pricing checks.
- [ ] Account-bound moodboard cloud writes remain part of the server-persistence dependency above; view controls do not claim that edits are synced.
- [ ] Verify and connect existing AI suggestions/import services before presenting those actions as available.

## V2.035 shared moodboard builder
- [x] Build the real section planner plus inline section controls, shared by all three moodboard views.
- [x] Persist section order, supporting-card choices and selected view with existing project saving.
- Account/server-only migration is still isolated; this UI release uses the restored browser persistence.

## V2.037 presentation editor integration
- [x] Keep Studio board, Editorial and Visual wall dashboards and their section builder; Build board opens the separate presentation editor.
- [x] Use project selections, chosen palette and client-visible insight data; return uploads to the shared Inspiration collection. Presentation removal does not remove dashboard selections.
- [x] Store presentation arrangements in the existing project payload; current V2 working-copy save behavior is unchanged and explicitly labeled.
- [ ] Cloudflare write-back remains required for cross-device persistence. No new browser storage system was introduced.
- [ ] Studio-wide General settings logo upload needs authenticated server settings; the production presentation editor does not pretend the mockup's per-session logo upload is a studio setting.
- [ ] Smart Layout currently uses layout rules, not image-analysis AI.

## V2.038 moodboard corrections
- [x] Open section builder by default, with dropdown groups first and close/reopen controls.
- [x] Disable the retired V1 moodboard wizard in V2. Styles and goals now open the client questionnaire at Style & inspiration, with a return to the moodboard.

## V2.039 moodboard controls
- [x] Visual client-facing insight catalog, category add actions, full Inspiration image upload/URL/drop dialog, and centered design-story editing.
- [x] Dashboard image cards/titles toggles, aspect choices, swipe rows and presentation card contrast on white sheets.
- Dropbox uploads remain unavailable until the website Dropbox connection exists. Existing on-device save behavior remains unchanged; server write-back is still pending.

## V2.049 cloud saving
- [x] Connect the existing private Cloudflare V2 storage service to the current interface, with studio-admin sign-in.
- [x] Automatic project, presentation, upload and preference saves; server revision conflicts block overwrites.
- [x] Recover valid older V2 device copies as separate server projects. Keep original browser backups untouched; no new device project/catalog writes.
- [x] Verify fresh-browser project/file restore, interrupted save/retry, preference restore, full navigation, and builder return in Chrome and Firefox. Live private test account verified separately.
- Individual designer/client accounts, invitations, studio logo management, Dropbox and complete ZIP archives remain separate unfinished integrations. UI role previews are not authorization.

## Project Home and delivery planning (requested September 28, 2026)

Design study: [Project Home, round two](../mockups/project-home-r2/index.html). Detailed implementation roadmap: [Project Home and delivery planning](project-home-delivery-roadmap.md). Mockup interactions are not working integrations.

- [ ] Connect Project Home to the selected project's actual records; remove fixed metrics, invented activity and placeholder deadlines.
- [ ] Build an editable, versioned step-by-step task roadmap across project phases, with prerequisites, effort estimates, completion evidence, and carried-over tasks. Use this as the foundation for next-action suggestions.
- [ ] Assign tasks and milestones to specific staff, with working hours, availability, leave, and capacity across all studio projects.
- [ ] Build a milestone planner with exact dates or estimated windows (for example 2–4 weeks), fixed versus flexible deadlines, owner, task dependencies, and automatic forecast delivery dates.
- [ ] Build weekly staff schedules with “Finish ASAP” and “Spread to deadline” preferences. Show infeasible schedules and staffing gaps instead of overbooking silently.
- [ ] Model project health, approval blockers, holds, and resumption. Shift dependent flexible work under explicit rules; preserve fixed deadlines and flag risk. Keep baseline, forecast, and committed dates distinct.
- [ ] Build an AI project brief grounded in actual phase, tasks, approvals, cost estimate, design-fee financials, and activity, with source links and freshness. Construction budget overruns alone must not trigger a design-fee change order.
- [ ] Connect email to projects, starting with last incoming/outgoing communication metadata, optional content access later, reviewed project matching, and role-based visibility. Do not infer approval or project holds from email age alone.
- [ ] Provide principal/admin, staff, and client Home variants with server-enforced access rules, configurable Home cards, and conditional savings/bid cards. Role previews are not authorization.
- [ ] Add real project activity, document revisions, and client approval history; Home shortcuts open existing workspaces rather than duplicating them.

## V2.054 approved Home fidelity
- Approved mockups are the implementation specification. Preserve their cards, order, layout, styling and interactions. Ask Warwick before any unrequested design change; missing data is not permission to substitute cards.
- P/Q/R use their approved Today cards, six Numbers cards and four Progress cards. Requested revisions remain: P/R equal-height swipe images, P four updates, Q blush focus highlight, R additional approval metric.
- Sample projects receive versioned, project-saved demonstration workflow records (tasks, approvals, milestone, fee/cash forecast, hours, roadmap and visual updates), without overwriting existing Home records. Real projects are not seeded. Estimate, water and questionnaire values read the engine.
- AI recap remains a deterministic project summary. Automated scheduling, real staff accounts, fee accounting integration and external activity ingestion still need their separate implementations.

## V2.055 public demo and private invitations
- Public demo runs without login or cloud calls; sample edits stay in memory and reset on reload.
- Email code sign-in and project-specific viewer/editor access are implemented and fixture-tested. Sharing is owner-only; storage and asset routes enforce access on every request.
- Activation dependency: Warwick must supply the owner email and verified email sender/service credential. No email secrets are configured on the worker. Do not claim delivery works until a real verification email has been received and tested. See `worker-v2/EMAIL-SETUP.md`.

## V2.058 accounts and V1 parity
- Built password login, verified email account/password setup, password recovery, visible account controls and a project picker before opening the workspace.
- Owner storage remains unchanged; new-user isolation and cloud save/reload are covered by tests. Registration remains owner-only at Warwick’s request; the owner's first password is entered by the owner, not the agent.
- Full V1 workflow migration is not complete. See `v1-v2-feature-parity.md` for the source-audited queue, existing tool connections, demonstration pages and required acceptance checks.

## Controlled demo access — deployed 2026-09-28
- Live private-hosted app: https://studioh-v2-storage.warwick-cca.workers.dev/app/ (V2.058).
- Worker version e63e303f-0b2f-44a1-82c9-20ca59439383, prior rollback version 47dc768b-8949-43b0-bb79-45adf4b82914.
- Registration remains owner-only; Cloudflare Access policy unchanged. Owner creates password through email verification. Actual owner password setup has not been completed by agent.
- Owner Account > Demo logins creates expiring demo usernames/passwords and revokes access. Demo workspace is session-only sample data, cannot read/write private projects.
- Tests: 12 backend cases passed, private-host account/save/reset browser test passed, Chrome and Firefox demo + moodboard builder tests passed. Production login UI verified; production anonymous engine denied (401), registration false.
- Private staging embeds sandboxed presentation assets in authenticated engine so opaque iframe needs no cookie-bearing nested requests.
- Older GitHub sign-in callbacks retained for existing frontend compatibility.
- No public GitHub push: automatic approval review blocked publishing new source given user's copying concern. Existing public repository remains public and must be addressed separately; cannot promise browser-delivered code is uncopyable.
- V1 parity work remains per v1-v2-feature-parity.md; route smoke checks do not mean all workflows/services migrated.

## V2.104 — Independent Proposal studio
- [x] Studio-level proposal library, approved A/B/C document layouts (A default), editable blocks, shared billing setup views, real rate-sheet pricing, sample creation and private revision-controlled persistence.
- [x] PDF/DOCX upload and review-before-apply AI extraction route; executed-PDF recordkeeping and explicit project conversion. No automatic sending.
- [ ] Select native versus embedded-provider signing. Enable only after verified recipient access, consent, immutable document version, retained evidence, completed PDF and client portal permissions are implemented and reviewed. Recording an externally signed PDF is not an e-signing certificate.
- [ ] Run a live AI extraction acceptance check against a chosen real proposal; service failure retains the source/draft unchanged.

## V2.105 — Proposal revisions (October 4, 2026)
- Implemented: step navigation resets modal scrolling; visible section numbering; separate contact/property fields with live Google address lookup; linked variables/search; optional contractual cap with conditional server validation; new/renovated site labels; separate remote/site meetings, travel policies and unlimited site hours; dated IRS mileage references; next-band quote for selected known services with custom-service gaps; cancellation configuration and Studio H preset; profession in studio billing defaults; fee/construction percentage; template style picker; private cover photos/slideshow/video; source-clause selection; additional-section remove/restore/reorder.
- Actual cancellation invoicing is not implemented: the preset stores client billing-rate basis, optional exclusion, penalty and cap; tested calculation helper does not replace reconciliation with recorded hours, invoices and credits.
- Parcel-area auto lookup needs a selected licensed or public parcel data source, coverage and source attribution. Manual lot area is clearly labelled; autocomplete does not infer parcel area.
- Client-view analytics requires recipient-scoped proposal viewing, permission checks, disclosure and visibility-aware event collection. No analytics events or client sends are enabled.
- Broad profession-specific fee benchmarks require scope-matched, sourced datasets; no universal 6–15% range is asserted. Profession currently stores metadata, not automatic fee or deliverable substitutions.
- Cover media is implemented; a free-form drag-and-drop page-layout builder, additional template designs and inline body media blocks remain design work. Current source clause library is Studio H's, not generic counsel-approved templates.
- Next-band quotes are list-price suggestions, not automatic amendments. New custom fees, bundle overlap, phase discounts and allocation instructions require review. No signed agreement is modified.
- Browser evidence: actual Google address selection populates city/state/ZIP; private image uploaded/rendered; field changes save/reload; cap-off survives reload; new step scrollTop=0; next-band sample 17,985; no browser errors in tested flow.

## V2.106 — Fee book and proposal setup
- Implemented editable studio fee book, proposal snapshots, package discounts, visual template examples, formatted currency, cap-off default, grouped scope and explicit project phase commencement.
- Parcel lookup is still blocked on a reliable attributed data provider; manual lot and designed-area inputs remain separate and editable. No new dependency reminder is needed until that integration is the active work.

## V2.110 — Proposal lot areas and package pricing
- Connected proposal address selection and existing blank lot areas to the same public LA/Orange county GIS parcel layers used by Project Info. County boundary area is an editable estimate, with parcel/source/date retained; missing or ambiguous parcels remain manual. Other counties are not covered. Designed landscape area remains separate.
- Live county metadata and browser CORS headers verified. Actual sample-address query was blocked by automatic approval review; awaits permission to send 1205 Patton Way, San Marino to LA County GIS for acceptance testing. Local geometry/coverage/failure tests pass.
- Multiplier uses direct employee pay, excluding employer taxes, benefits and overhead. Saved rates previously marked inclusive require explicit review; no invented payroll percentage. Existing allowance overrides remain untouched.
- Packages support percentage and dollar reductions, with proportional cent-exact phase allocation, subtotal cap, individual prices and net package totals in the proposal. Pricing groups remain separate. Packages apply only when all member services are included in base fixed-fee scope.
- 87 automated tests pass. Browser verified dollar-discount save and proposal display ($7,190 less $1,000 = $6,190), and direct pay example ($3,000 / 3 / $50 = 20 hours).

## V2.111 — Property boundary parity repair
- Found the V2-only failure: both its fetch guard and engine Content Security Policy omitted the existing V1 county parcel query endpoints. Restored exact read-only query paths, with credentials omitted and redirects rejected; unrelated requests remain blocked.
- Existing V1 parcel polygon drawing and fitting remain intact. 88 tests pass, including guard regression coverage and inline-source parity. Real-property visual acceptance still requires the user to reopen Project Info or authorize the pending sample-address test.

## V2.112 — Design packages review
- Interactive design review at assets/reviews/design-packages-r1/: saved package library, a-la-carte/packages tabs, searchable service switches, budget-linked sample pricing, editable fees, private allowances, percentage/dollar savings, proposal versus saved-package edits, and a simulated add action. This is fictional in-memory review data, not a live package library implementation.
- Live maintenance: package-member search, full-travel switch CSS, explicit fee-book-copy label, and proposal budget validation before range-price application. Existing Apply copied the fee book without selecting package member services; the review proposes a separate Add package action.
- 88 tests pass; browser verified review search, selecting another member, recalculated total and missing-budget blocking.

## V2.113 — Saved design packages and full proposal proofs
- Built Design Packages beside À la carte: saved library, searchable service switches, percentage/dollar discounts, editable draft-only prices/costs/hours, and explicit saved-price updates per pricing context.
- Add package uses the actual proposal construction budget, requires complete prices, selects/updates matching services without duplicate rows, and replaces overlapping active discounts. Manual phase-fee mismatches and percentage/hourly proposal conversions require review rather than silently changing fees.
- Client document shows service prices, subtotal, saving and package total; internal hours/costs remain private. Browser verified save/reload and an edited $6,695 subtotal less 10% = $6,025.50.
- Three complete nine-page design PDFs plus matching live review at assets/reviews/proposal-signing-r2/. A portfolio, B editorial serif, C image-led. Live slideshow and local video preview; PDF signature-placement demonstration and downloads. Fictional sample data, existing reference imagery, full 24 reference terms and 10 exclusions.
- PDFs are design proofs, not executable agreements. Legacy terms contain inconsistent payment/cancellation provisions; studio review is needed before signature. No signing provider integration was added.
- Reproducible PDF generator: worker-v2/build-proposal-proofs.py. Requires ReportLab and Liberation fonts (STUDIOH_SANS_FONTS / STUDIOH_SERIF_FONT optional overrides).

## V2.114 — Editable proposal refinement review
- New review at assets/reviews/proposal-refinement-r3/: aligned cover/fee panels, two switchable investment/payment layouts, phase-first deliverable descriptions, meetings/revisions/start conditions and editable milestones. Structure informed by the Lim proposal in Dropbox; all client data shown is fictional.
- Larger phase labels, number pills, bold hourly prices, three-column exclusions and two-column terms. Same render source now drives web and US Letter pages; pagination checks oversized blocks and disables export if text would overflow. Browser verified all three styles and selection totals.
- Prototype direct editing, image selection/crop/upload/slideshow membership, system styles and saved template copies. State is memory-only in the review tab, clearly labeled. Permanent studio media/template storage and integration into the live builder remain future work.
- Optional-service cards include full scope and format inline, explanatory dialogs and recalculating totals. Signing handoff is a demonstrator: final letter preview/print only, no provider API or portal integration, no emails/signatures.
- Four regression checks cover selected-option/payment reconciliation, discount bounds, matching web/letter content and text escaping. Reference legal wording remains a proof requiring studio review; no executable agreement is generated.

## V2.115 — Visual phase cards and section composition
- Reworked the existing proposal-refinement-r3 review with two-column phase cards, editable plan examples, prominent net phase prices, duration pills and explicit per-phase package savings. Construction Observation is an optional numbered phase with one hourly rate or staff-based billing, also shown in the investment summary.
- Fixed slideshow frame growth by replacing only the absolutely positioned image content; added previous/next controls. Increased budget figures and fee-summary phase totals; removed the final additions divider.
- Replaced jargon-heavy milestones with a client-facing What to expect guide, identifying Client, Designer and shared actions. Deliverables and Commencement Date labels now match user wording.
- Build sections supports show/hide, native drag reordering and accessible move buttons, optional Why hire us, global image visibility, and text/image/split/three-card blocks. Review-only memory state; not permanent studio storage.
- Letter composition now breaks between scope items and timeline steps, uses compact optional-service rows and numbered legal rows. Default sample reduced from 16 to 11 pages with no overflow detected; no contract wording removed. Browser verified section ordering, custom blocks, example popup, slideshow frame bounds and letter layouts.
- Added regression coverage for section order/numbering, observation numbering/rate modes and image visibility. No signing or infrastructure changes.

## V2.116 — Twelve proposal design alternatives
- New comparison gallery at assets/reviews/proposal-design-options-r4/ with three mockups each for section builder, sequential phase composition, fee summary and template picker. Each phase remains in order; alternatives vary the cards within the phase. These are design previews awaiting user selection.
- Builder examples use normal fixed-size switches, wide section labels and actual layout thumbnails. Template examples use the same system typeface, landscape previews, spacing, search and six sample templates across grid/rail/master-detail treatments.
- Fixed the existing refinement review checkbox width conflict with generic dialog input styling. Added requested pink responsibility pills, blue role-rate cards, softly tinted exclusions/terms and consistent heading font. Replaced glyph-only block icons with miniature layouts.
- Browser checked all twelve options at desktop and 820px width with no page overflow or broken images; tested template search, carousel navigation and example popup. Verified original review switches remain 46px wide while labels use the available space. PDF layout work remains deferred at user request.

## V2.170 — adopted full phase model (October 9)
- Canonical engine phases: Consultation; Programming & Site Analysis; Schematic Design; optional Design Development; Construction Documents; Bidding / Negotiation; optional Construction Observation; Closeout.
- Added 9 DD, 10 observation and 5 closeout source checks. Existing source IDs and both Programming/Site Analysis groups preserved.
- Permitting has independent status alongside design. Existing permit/HOA work migrates by source identity, retaining saved details. Conditional approval injection remains project-driven.
- Standard phase fee shares are displayed as defaults, not applied to existing agreements. Task durations remain unassigned.
- Phase approval remains the current review stage. Deliverable structure and detailed task defaults require the user's subsequent review; the previous authored draft is not an approved project template.
- Runtime phase-model.js updates the preserved deployed engine before Process initializes; source snapshots are also updated. Release source must be committed and pushed with deployment.
