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
- ONE shipped file: `index.html` — this is what gets pushed to GitHub each version.
- Bump the version number in `index.html`.
- Backup every version: copy `index.html` to `versions/Cost_Estimator_vXXX.html` (underscores, no spaces).
- `versions/` is gitignored — backups stay local, never pushed to GitHub.
- **Auto-push every version.** Standing authorization: after validation passes, commit `index.html` and push to `origin/main` without asking. Commit message = the version's one-line change + `(vXXX)`. Never leave a finished version sitting unpushed.

## Building from an approved mockup
An approved mockup is a spec, not a reference. Before writing any code:
1. **Open the mockup file and read it.** It is on disk in the scratchpad. Never work from memory of it.
2. **Transcribe values, not token names.** A mockup defines its own `--card`, `--soft`, `--br`. The
   same name means a different colour in `index.html` — map every one by hex.
3. **Build all of it.** If any part is going to be skipped or kept from the old UI, say so *before*
   building, not after.
4. **Put the two pictures side by side before saying it is done.** Screenshot the build, crop it to
   the same region as the mockup, and compare fill, border, radius, spacing, alignment and type
   weight. Looking at the build alone does not count.

## Before saying a build is done — answer these in writing, in the reply
Every failure on this project has been one of these four. Answer all four explicitly
or the work is not done. No exceptions, no "mostly".

1. **Did I open the mockup file and list every element in it?** Write the list, and mark
   each one built / not built. If anything is "not built", say so BEFORE building, not
   after shipping. A design is not a menu to pick from.
2. **Did I measure the target styles from the live DOM?** Sample computed styles off the
   real element (container background, pill radius/padding, thumb px, font px). Never
   transcribe a value from memory or from a token name — the same token is a different
   colour in a mockup than in `index.html`.
3. **Is the new thing what the user sees by default?** Never gate approved work behind a
   toggle, a new view mode, or a saved preference. If the old UI still renders on load,
   the build is invisible and therefore not delivered.
4. **Did I delete what the design replaces?** A redesign that leaves the old controls
   sitting above it has doubled the confusion, not reduced it. Name the removals.

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
- **Per-user plant-report image framing** (zoom/pan). Currently stored globally on the shared plant-book record (`imgZoom`/`imgPanX`/`imgPanY`), so one user's adjustment would change the image for all users. Once user profiles exist, move this to per-user (or per-project) so reframing is scoped to that user and never affects the shared book.
