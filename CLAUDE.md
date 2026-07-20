# Studio H Estimator — Project Rules

## What this is
Client-facing landscape cost estimator for Studio H (residential landscape architecture, LA/OC).
Live: designingla27.github.io/studioh-estimator · Repo: github.com/designingla27/studioh-estimator

## Architecture
- Single-file vanilla HTML/CSS/JS: `index.html`. No frameworks. No new external dependencies.
- Hosting: GitHub Pages ONLY. Never suggest Netlify or other hosts.
- Backend: Cloudflare Worker `studioh-ai`
  - KV: `studioh-plants` (bid data, plant book, prefs)
  - R2: `studioh-pdfs` (PDFs, raw binary — NEVER base64, it crashes Workers)
  - R2: `studio-images` (note: `studio-`, not `studioh-`) bound as `IMAGES` — AI renders + plant images re-hosted here (fal.ai URLs expire)
- AI: Anthropic API (plant suggestions, cost analysis); fal.ai for images (default model: Nano Banana 2)
- Maps: Google Maps API (address lookup, tracing)

## Hard rules
1. **Pricing accuracy is the top priority. Always.**
2. **Only make the specific edit requested.** Never remove, alter, or "improve" anything else. Preserve all existing features exactly.
3. **One change at a time.** Never bundle unrequested changes.
4. **Fix, don't explain.** Deliver the fix; explanations only if asked.
5. **Grep the live file before claiming a feature doesn't exist.**

## Deliverables per version
- TWO files every version: `index.html` + `Cost_Estimator_vXXX.html` (underscores, no spaces)
- Bump version number in both

## Validation before shipping
1. Python-extract each `<script>` block
2. `node --check` each block — expect "ALL JS OK"
3. Headless node + cairosvg visual QA where relevant

## UI conventions
- Target: 13-inch iPad, max-width 1280px. Compact, minimal.
- Buttons over dropdowns when options are few; tappable tiles over checkboxes.
- Tested in Chrome (dev), verified on iPad/Firefox/Safari.

## Known pitfalls
- Helper functions scoped locally to one builder break others — define shared helpers globally at top of file.
- Large-file base64 crashes Workers — R2 uses raw binary; KV for metadata only.
- `_pdfSig` fingerprint skips re-uploading unchanged PDFs on save.
- fal.ai image URLs expire — always re-host to `studio-images` R2; `_ensureR2()` gates generation.

## Key modeling decisions
- Plant water: real-world established (client default) vs MWELO (behind checkbox). They are NOT the same — keep both models separate. Year 1–10 establishment curve included.
- Sun tolerance is a multi-value range (`lightSetOf`, `toggleLight`, `LIGHT_ORDER`), intersection-based matching.
- Plant quantities auto-calc via `rowQty(r)` reading `_calcQty` from the pricing pass.
- Favorites/prefs sync to Cloudflare via `SHARED_CFG_KEYS` (union-merge). Publish master saves book + favorites + prefs + pricing in one click.
- Midjourney = concept renders only (not plant-accurate); in-app Nano Banana 2 for plant-accurate zone/grouping renders.

## Build sequence (locked)
Finish calculators → save/load → PDF/export → real prices → backend/AI last.
All AI-dependent features (narratives, plan review, PDF symbol counting) land in the final backend phase.

## Deferred to backend/accounts phase
- Client portal (sandbox only, never source of truth; margin/markup ALWAYS hidden client-side)
- Per-user accounts + per-user plant favorites (separate from shared master book)
- Shareable client report URLs
