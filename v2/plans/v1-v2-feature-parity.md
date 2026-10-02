# V1 → V2 feature parity

Requested September 28, 2026. Start after account/login work. Preserve approved V2 layouts; do not substitute illustrative data for project records.

## Finding
V2 is not an empty engine: `build.py` embeds the existing V1 tools from the root `index.html`. However, several outer V2 pages remain demonstrations, and the embedded tools intentionally block remote calls except maps. A mounted tool is not proof that its complete workflow is connected.

## Migration queue and acceptance checks

| Area | Existing V2 connection | Required work / acceptance |
| --- | --- | --- |
| Project info, questionnaires | Original forms through bridge; snapshots saved by authenticated parent | Verify all editable fields and questionnaire steps survive cloud reload and project switching |
| Programming / tracer | Original take-offs; PDF, DXF, JPG and satellite adapters | Verify quantities reach estimate; reconnect authenticated AI placement requests with review/apply intact |
| Estimate / pricing rules | Original estimate and algorithms routes | Compare identical saved V1/V2 project totals, allowances, assemblies and adjustments |
| Savings | Outer page displays fixed sample alternatives; original `ve` calculator is one button deeper | Bind approved outer layout to real project scenarios; verify applying/reverting savings changes correct quantities and totals |
| Bid Compare | Original tool route mounted | Audit upload/extraction requests blocked by frame guard; connect through authenticated, bounded backend; test actual comparison/export |
| Moodboard / presentation | Real selections and builder; cloud snapshots/media | Verify library edits, layouts, image changes and exported PDFs on reopened project |
| Plant/material/furnishing/color libraries | Parent catalog readers + project copies | Separate studio-owned records from public references; restore authorized editing/import/AI workflows rather than permit arbitrary iframe networking |
| Price book / products / nurseries / HOA / cities | Original routes or outer preview pages | Inventory each remote operation, sources and shared-vs-private writes; test save/reload against correct account |
| Reports / checklist | Original dialogs reachable | Verify actual PDF generation, downloaded file contents and complete project data |
| Financials / proposals | Outer V2 demonstration (`layout.html`) | Identify real V1 data/functions if present; bind agreed fees, time, invoices and profitability. Do not pretend mock financial metrics are migrated features |
| Client Center / sharing | Outer sample decisions/chat/files; API has limited existing owner invitations | Build account-specific project membership and client-safe views; connect approval records/files; no UI mode may grant access |
| Studio business / resource/community | Sample pages or roadmap work | Distinguish existing V1 capabilities from genuinely new work; replace sample stats only when real records exist |
| Ask Studio H | Mock response UI | Authenticated AI service with selected project context and source references |
| Backups / archives | JSON export/import current project | Verify attachment completeness; implement all-project archive separately; do not label JSON as a full archive |

## Release discipline
Each workflow must pass: open → edit → save → reload → compare saved values → switch projects → ensure no account leakage → export where applicable. Keep V1 unchanged while porting. Audit findings above come from source inspection, not live workflow completion.

## Browser route audit
All 19 checked routes opened inside V2 with no page-level JavaScript errors: project info, client questionnaire, designer questionnaire, tracer, estimate, Savings calculator, bid comparison, Plant Book, Price Book, materials, furnishings, products, Color Library, HOA, nurseries, reports, checklist, algorithms and insights. This is an opening/navigation check only; workflow save/export/network parity is still outstanding.

## V2.061 Account and settings step
Live version30bf1ed7-984c-4699-be4a-93b11c22821d; rollback62c9a7a2-4c57-4d96-ac96-60bdbb476559. Account > Account details shows real name/email/role, profile name edit, current-password change, email reset, owner demo controls, signout. Email remains verified/read-only. Password changes rotate session credential version and invalidate other sessions. Backend profile uses CAS, session response refreshes name fromcredential.
Settings > Studio defaults connects firm details, quality, markup, goods model, pricing location and tool hints to V1 PREFS. PREFS now saved in account preferences and overlay engine project seed; settings tests signout/reset/reopen confirm persistence. More tool settings opens original V1 settings for other controls; not all advanced GSET/algorithms workflows are account-scoped or audited yet.
Tests13 backendpass; WebKit account/profile/password/studio defaults/save/reopen/advanced settingspass. Actual localCloudflare routing samplehomepass. Live indexverifiedV2.061. Do not claim all V1 parity complete. Next compare identical V1/V2 project calculations, then network services.

## V2.062 verified calculation and sample migration step
- Top Account menu removed; Log out is the signed-in header action. Account controls remain in Settings.
- Independent V1 and V2 browser engines compared against two real saved V1 samples with the same saved price book, assemblies and pricing settings. Eleven scenarios passed (saved, quality modes, markup, market adjustment and built-in sample); full section/item/state equality plus plants/measured/planTrace/trace payload equality. Quality mode changes alone do not reprice existing saved lines.
- Owner-only idempotent import copies both source samples, raw bids and calculation configuration. Existing V2 copies are never overwritten. Runs on owner's next authenticated project picker; no production owner session was available to execute that migration during deployment.
- Safari integration imported the actual estate record, opened it, saved it, reloaded it and retained the matching total and all 16 traced polygons. Backend 14 tests pass; account settings/password/logout tests pass Chrome and Safari.
- Remaining: validate questionnaire edits, tracer quantity edits, reports/exports and reconnect guarded remote service workflows. Calculation parity is not full app workflow parity.

## V2.063 library reads restored
Cause: parent catalog requests still targeted V1 cross-origin hosts, and embedded library reads were blocked by the sandbox guard. Added owner-authenticated /libraries/read with exact loadbook/loadconfig/loadgoods allowlist and fixed service bindings. No write operation is forwarded. Parent and embedded libraries now use it. Configuration fills missing keys and price-book rows, retaining existing values; private catalog overlays are retained.
Verified source counts: plants4556 (tree837/shrub3234/gc465/palm20), materials618, furnishings/products337, HOA17, site elements0, swatches2, palette presets1, color palettes71, manufacturer colors438; price book17 sections/456items. Site elements is also empty in V1.
Safari actual-fixture tests verify displayed plants/materials, automatically loaded furnishings, all auxiliary library responses, private overlay retention, unchanged estimate, sample save/reload. Fifteen backend tests pass including read allowlist/owner isolation. Remote publishing/import/AI services remain separately unconnected. No new public source push.

## V2.064 shared studio configuration and iPad navigation
Root cause of single-section screenshot: V1 pbTreeShut defaults collapsed below1100px but renderer had no pbTreeToggle button. V2 build adds a labelled Sections toggle, preserves the original list and inspector. Verified 26 navigation entries at1280x960 Safari.
Shared config keys, algorithm overrides, catalogs and private catalog edits are promoted to account preferences and overlaid into every engine seed. Removed from subsequent project engine snapshots; originals remain in previous revision/history. Existing shared value takes precedence over old per-project copies. Compressed preference assets now use accounts/OWNER/studio/assets rather than project-owned asset paths. Old asset references remain readable.
Tests: complete PB objects, algorithm defaults/overrides, labor rates and ASM_LIB deeply equal between independent V1 and V2 engines across11 scenarios. Safari edit price+algorithm, create another project, save/reload verifies both account values and no such keys in new project engine. Studio asset isolation test and all16 backend tests pass. Shared preferences currently per account user, not a multi-staff studio settings permission system. V1 cloud master has no saved studioh_algo_v1 override; V1 embedded default algorithms are preserved.

## V2.065 Design Engine Library
Connected original private R2 studio-h-library-private/release pages under authenticated /design-library/. Library is independent of projects. Cloud manifest hashes match local library.json/data.js/index, insights pages and rules catalog. Published source has35projects/14091records (25 original coverage plus10 subsequent Quick Adds), not the stale10-project snapshot. All58 generated category chunks compare exactly to original records. Original71MB data.js replaced with category-on-demand views; original full JSON/database/source exports remain available from protected source bucket. No R2 source changes. Design Rules includes category navigation/search and26source documents; publication is not proof of implemented geometry enforcement.
Calculated-values page contains reviewed subset measurements; preserve denominators/source versions/unknowns and do not claim every35project has every measurement. Original misleading10-project library wording updated to reviewed-subset wording in V2 view only. V2 Libraries contains Design Engine Library and Design Rules.
Tests: Safari routed fixture verifies35projectmetadata/14091recordcount, navigation to calculated values and rules, plus source bucket manifest/auth checks. Cookie forwarding in browser harness is explicit from context cookie jar; actual owner session not available for private live browser verification. Source records equality verified independently.
