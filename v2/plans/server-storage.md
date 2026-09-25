# V2.030 — server-authoritative workspace

## Architecture

Frontend remains on GitHub Pages. New Cloudflare Worker `studioh-v2-storage` owns private R2 bucket `studioh-v2-private`; no existing V1 Worker or binding is changed. A service binding to `studioh-ai` validates the existing publishing credential without writing a V1 record (the PDF handler validates credentials before returning the deliberately omitted-id error). The verification contract fails closed. Random 256-bit sessions are stored hashed, expire after 14 days, and can be revoked. Only the fixed frontend origin is allowed.

Every API request requires a session. Account identity comes from the server session, never a UI role parameter. Initial sign-in grants the existing studio administrator access; subscriber/client accounts and invitation policies are not implemented by this release. The role toggle does not grant access. Project/file requests are prefixed by the authenticated owner; preferences by owner and user.

Project JSON carries the original V1 bid shape, separate engine settings and V2 workspace data. Photos, uploaded originals, PDFs and documents are extracted into raw private R2 objects with SHA-256 identifiers. Project records contain references. Media loads through authenticated requests into temporary browser memory. Shared catalogs are read into memory, not duplicated in every project. Project snapshots retain selected plant definitions. Private edits made through original plant/material/furnishing tools are stored as project deltas, including unselected custom records; this does not publish a shared master catalog.

R2 conditional writes and an explicit `X-StudioH-Revision` protect concurrent edits. The explicit header avoids CDN compression weakening HTTP ETags. Previous versions are retained before replacement. Failed saves never show success or fall back to local disk. A conflict offers a separate new project; it does not silently overwrite another device's data.

## Browser migration and exceptions

The Storage-shaped adapters in parent and frame use memory. Account preferences and project settings flow to the server. Startup reads old V2 IndexedDB/localStorage only for recovery. All valid working copies, including the previous-work backup, are uploaded as deterministic, separate recovery projects. Each is read back before old V2 stores are removed. A failed migration preserves local originals. V1 stores are untouched. Older open V2 tabs can block deletion and must close before cleanup completes.

Allowed device use: session cookie (Secure, HttpOnly, SameSite=Lax), transient working memory, public application-asset browser cache, explicit user-requested export/download. No new project, reference-image or catalog database is created in the browser. Offline edits have no durable local fallback: leave the tab open and retry until it says Saved to Cloudflare.

## Validation

- Worker tests: denied anonymous/wrong-key/cross-origin requests, account isolation, raw file hashes and retrieval, conditional updates, previous versions, session revocation.
- Browser regression: save and reopen in a separate clean context, photo tags/favorites, document bytes, moodboard state, no browser database, stale edits protected, verified migration and cleanup, interrupted-save state and successful retry.
- Live Cloudflare with an isolated test account: raw uploads, project save, a fresh browser restored project/photo/tags/file, stale revision rejected with 409. No user project was used in these checks.
- Original root V1 source remains unchanged. All generated scripts syntax checked.

## Remaining separate integrations

Individual designer/client accounts and project sharing, Dropbox authorization, AI requests still blocked by the V2 service boundary. These limitations do not prevent the studio administrator's built V2 project editing from saving to Cloudflare.
