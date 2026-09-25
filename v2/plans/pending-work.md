# Studio H pending work

Update this list at each release. Raise a dependency when the current feature needs it. Do not treat a mockup as a completed integration.

- [ ] Authenticated user accounts and project access rules. Needed before customer invitations, private shared files, or customer cloud saves. Developer/Designer/Customer switches currently preview UI; they are not authorization.
- [x] Cloudflare V2 project write-back and private R2 media storage (V2.030). Studio-admin authentication, cross-browser reopening, autosave, revision checks, recoverable previous versions and automatic verified migration of old V2 device data. Files up to 50 MB each. Individual subscriber/client invitations and permission rules remain a separate unfinished feature.
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
- [x] Moodboard project selections and view preference save to private Cloudflare project storage in V2.030.
- [ ] Verify and connect existing AI suggestions/import services before presenting those actions as available.

## V2.030 storage boundaries
- New V2 project data and preferences are server-authoritative. No local project/catalog cache fallback. Temporary unsaved edits stay in memory only and show a warning if the save fails.
- Sign-in uses the existing studio publishing credential with a private HttpOnly cookie; the browser memory holds the API session while open. Developer/Designer/Customer switches still preview interfaces, not independently authenticated customer accounts.
- Older V2 tabs may need closing to finish verified cleanup of old browser stores. Original V1 storage and projects are untouched.
- Dropbox OAuth and AI service connections remain pending integrations; they are not local-storage fallbacks.
