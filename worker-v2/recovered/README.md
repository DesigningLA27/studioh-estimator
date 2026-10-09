# V2.169 source recovery — 2026-10-09

The production app is https://app.warwick.design/app/. This commit recovers the
V2.169 Worker and frontend updates previously released only to Cloudflare.

## Source of truth

- `../src/index.js`: current readable backend, extracted from the deployed bundle.
  It imports generated frontend/review maps instead of storing huge HTML strings inline.
- `../../v2/`: current frontend, including Process/checklist, settings, bids,
  financials, demo support and sample fixtures.
- `../../reviews/`: all 20 deployed review pages. These are drafts, not approved templates.
- `live-v2.169.mjs`: exact deployed Worker checkpoint (SHA-256 in `manifest.json`).
- `manifest.json`: recovery provenance for each requested runtime asset.

The Worker and its 37 embedded assets were verified against the live deployment.
289 fallback files were downloaded from the live app. Authorization-protected
fallback files were retained from the recorded V2 source baseline; they could not
be independently compared with live bytes in this recovery. This limitation is
explicitly recorded per file. The original Worker checkpoint also depends on
Cloudflare's existing ASSETS binding; it is not a standalone backup of that binding.

No customer projects, credentials, session tokens, private design-knowledge JSON,
Cloudflare settings exports or account backups are included. Google Maps browser
key literals in frontend source are replaced by `__GOOGLE_MAPS_BROWSER_KEY__`.
Supply the restricted browser key with `GOOGLE_MAPS_BROWSER_KEY` at deployment.
This does not revoke any key already present in older Git history.

## Build and check

From repository root:

```
python3 worker-v2/build-current.py
node --test v2/tests/current-process.test.mjs v2/tests/current-settings.test.mjs v2/tests/current-bid.test.mjs
```

The build creates ignored `worker-v2/generated/runtime-assets.mjs` and
`worker-v2/.private-app/`. It does not deploy or change project data.
Wrangler's build hook requires the Maps key before deployment. Use the private
Wrangler configuration for the ASSETS binding. Do not run the older V1-derived
`v2/build.py` or `v2/build-shell.py` to recreate this release: they predate the
recovered frontend. Other backend modules remain as historical editable references;
`src/index.js` is the actual current entry point.

GitHub Pages cannot provide the same-origin authenticated API. Its `/v2/` entry
therefore opens the canonical live app instead of presenting a stale or broken UI.
The complete frontend remains available under `v2/` for code review.

For subsequent releases, edit repository source, build, test, commit and push
before/with deployment. Do not patch only the Cloudflare bundle. Update the asset
and route lists in the recovery manifest when introducing a new override/route.
