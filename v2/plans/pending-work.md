# Studio H pending work

Update this list at each release. Raise a dependency when the current feature needs it. Do not treat a mockup as a completed integration.

- [ ] Authenticated user accounts and project access rules. Needed before customer invitations, private shared files, or customer cloud saves. Developer/Designer/Customer switches currently preview UI; they are not authorization.
- [ ] Cloudflare V2 write-back and private media storage. Needed before cross-device photo/file editing. Existing V1 project reads work; V2 changes remain on-device. Source document uploads currently have a 1.5 MB per-project preview limit.
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
