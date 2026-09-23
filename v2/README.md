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
