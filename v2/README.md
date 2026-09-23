# V2 preview — isolated interface build

URL: `https://designingla27.github.io/studioh-estimator/v2/`

## Scope

The V2 navigation and four themes wrap the existing v1571 tools. Calculators and
project data shapes are reused; the production `../index.html` is unchanged.

Connected: Project Info, client/designer questionnaire, photos, tracing launcher,
estimate, Savings, Bid Compare, Insights, Plant Book, Price Book, Materials,
Furnishings, Products, Color Library, HOA, city setbacks, Nurseries, Algorithms,
checklist and reports. Engine screens retain their existing tool layouts with V2
chrome and surface styles. This is an initial functional preview, not a completed
screen-by-screen V2 redesign.

Financials remains an interactive example: editable fee assumptions, deliverables,
team rates, contractor fees, proposal/signature simulation and profitability.
It is not an issued proposal or a signing service. Client Center, community,
resources and studio business include clearly marked future-workspace previews.

## Isolation

- Engine runs in a sandboxed iframe **without allow-same-origin**. It cannot access
  the host/V1 localStorage or parent DOM.
- Engine CSP `connect-src 'none'` and `form-action 'none'` block API writes and
  reads. Fetch also returns an explicit preview-only error. No production keys
  are copied or needed. Service worker registration is disabled inside the engine.
- Engine localStorage is an in-memory facade, persisted by the parent only under
  `studioh_v2_preview_store_v1`. Financial example and theme have separate V2 keys.
- Importing V1 JSON restores a COPY inside the sandbox. Saving/exporting V2 never
  writes a V1 project or shared library. Libraries begin with the bundled seed data;
  the production cloud catalog is not automatically pulled.
- `Save preview` is device-local. `Export project` downloads the existing project
  JSON format. Import a downloaded project via `Preview project`.
- Cloud uploads, AI, online lookups, scraping and cloud sync are deliberately
  unavailable until a separate test backend and credentials are configured.

## Rebuild

`python3 v2/build.py` snapshots the existing engine and adds isolation and a small
iframe communication adapter. `engine-source.json` records its source hash.
`python3 v2/build-shell.py` builds the shell from `src/layout.html`.

Do not replace V1 or remove the sandbox to make an online feature work. Add a
separate test backend first. Before publishing fetch/review origin/main, commit
only V2 files, and use a normal fast-forward push (never force).

## Verification

`tests/preview.browser.cjs` checks connected routes, questionnaire rendering,
local save/reopen, inability to read/write V1 storage, zero production API requests,
and shell widths. Set PLAYWRIGHT_MODULE and PREVIEW_URL for another environment.
Script blocks are syntax checked and V1 hash compared with engine-source.json.

## Remaining V2 work

- Rework individual legacy tool interiors against approved V2 designs.
- Configure a separate test backend for cloud library copies, maps/lookups, uploads
  and AI. Verify real iPad, Safari, camera, PDF tracing and report print/export.
- Replace future-workspace previews as their roadmap functionality is implemented.
- Financial templates, rates, proposal terms and signing workflow need studio
  decisions; no illustrative financial numbers are production defaults.

## Expanded workspace preview · 23 September

The default experience now uses the V1 sidebar structure: 236px expanded rail,
project picker, original V1 SVGs, 13.5px labels, 10px row corners, pin/collapse,
mouse hover, keyboard focus expansion, touch logo/menu, width adjustment, separate
navigation scrolling, and bottom Settings. Four themes remain available.
The earlier tile-only navigation is hidden and replaced by this rail.

### Built and interactive with local sample data

- Dashboard: phase selection, checklist, activity and sample project metrics.
- Brief & site: five numbered steps linking the real project tools.
- Design: overview, builder entry points and rendering workflow preview.
- Mood Board: reorderable sample sections, notes and presentation dialog.
- Insights and Savings Center: sample findings, selectable alternatives and budget-gap calculation.
- Client Center: local chat drafts, approvals/change requests, shared-file samples,
  client portal preview, and the same proposal demonstration as Financials.
- Financials: the existing interactive fee builder, deliverables, staff rates,
  contractor cost, proposal signing simulation and profitability forecast.
- Delivery: checklists, report entry points, sample Plan Check findings and specifications.
- Libraries: original working libraries, City Library directory, CAD samples,
  Product Watch findings with accept/dismiss interactions.
- Resource Center: guides/tool links, favorites and saved website links.
- Community: local discussion drafts, saved sample collections, contribution drafts and guidelines.
- Studio business: project overview, local phase-based time entries, sample change orders and team chat.
- Site studies: illustrative time slider, seasons, take-off-set selection and scan examples.
- Settings: all themes, navigation preferences, role previews, calculation/admin entry points.
- Searchable roadmap: 130 entries drawn from ROADMAP.md and the open BACKLOG.md section.

Sample figures and conversations do not represent the imported project. All sample
edits use `studioh_v2_workspace_v2`; they do not update the project engine or V1.
The time-entry demo does not feed the fee forecast. File/CAD cards are examples,
not downloadable technical documents. Sun/shade and plan findings are illustrative,
not calculations or AI analysis. New service features remain demonstrations, as requested.

### Verification

`tests/workspace.browser.cjs` covers every new workspace, rail pin/hover, all themes,
chat/approval/savings/time/watch interactions, local persistence, return from engine
screens, and 390–1440px layouts. The original engine regression also passes.
V1's expanded DOM was measured (236px, 13.5px labels, 10px radius, 8.25px/11.7px
padding) and compared visually with the V2 rail (236px, 13.5px, 10px, 8px/12px).
The Afternoon rail uses #42523a; Day retains V1's #35502a. Cards use #fff on #faf9f6,
20px corners, and no decorative borders. Real iPad Safari remains a device check.
