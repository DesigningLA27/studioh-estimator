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
