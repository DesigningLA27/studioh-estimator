# Dropbox project import — implementation boundary

Design study: `v2/mockups/project-identity/`, Study 01. This is a reviewable interface prototype; it does not connect Dropbox or import real files.

## Approved direction from the user

- One primary project photo selected from Photos & references, referenced by ID on Project Home and Project info. Keep the rest of Home intact.
- Programming uses the actual V1 tracer. The source thumbnail is the project's satellite view or imported drawing, ideally with saved traced areas; it is independent of the primary project photo.
- Import selected Dropbox files or connect a project folder so AI can find base plans, HOA guidelines, address/contact information, proposals and fees.

## Current verified behavior

V2 is generated from the repository's unchanged V1 source. `ptReopen`, `_ptOpenDocBuf`, `ptOpenSatellite`, `ptRenderModal`, and the take-off/drawing implementation are included. The Programming launcher opens the existing tracer, not a reimplementation. The browser regression checks PDF opening, supported DXF conversion, save/reopen of traced geometry, and responsive widths.

Live satellite services are not yet enabled: the V2 engine has an opaque-origin sandbox and a no-connections policy. Do not claim that the satellite action is functioning until an explicitly bounded map service path has been built and tested. Do not enable all V1 network writes to solve this.

The current mockup Sample Demo is a generated schematic PDF. It is not the actual Nest Pine CAD file. Do not silently substitute it or describe it as a Dropbox import.

## Account and configuration prerequisites

The website has experience previews, not authenticated customer/designer accounts. The Codex Dropbox connector is not an authorization grant to the website. We need the Studio H Dropbox app registration and real Studio H user/project identity before a persistent account-owned connection can go live. The user has been asked whether to create a new app or use an existing one.

## Backend contract to build after configuration

Use a separate Cloudflare account-aware integration, preserving the existing V1 worker and its bindings. All endpoints require a verified Studio H session and project membership. Designer-only access to fees and private proposals must be enforced server-side, not inferred from the preview switch.

- `POST /projects/:id/dropbox/connect`: create single-use OAuth state tied to user/project and initiate authorization. Use PKCE, an exact registered callback, read-only scopes (`account_info.read`, `files.metadata.read`, `files.content.read`) as required. Request offline access only for a persistent connection. Encrypt refresh tokens server-side; never put them in project JSON or localStorage.
- `GET /dropbox/callback`: validate state, exchange the code server-side, bind the provider account to the authenticated Studio H user.
- `POST /projects/:id/dropbox/folder`: save a provider folder ID and path root. Enforce the project-folder boundary for every list/search/download. Dropbox's Full Dropbox access may be needed for an existing project folder; the application's selected-folder limit must not be described as a Dropbox-enforced OAuth folder scope.
- `POST /projects/:id/dropbox/scan`: list the selected folder with pagination, classify supported files, and persist cursors and revisions. No writes to Dropbox are needed.
- `GET /projects/:id/imports/:job`: show per-file progress and errors. Treat file contents as untrusted data; document instructions cannot change system behavior or cross project/account boundaries.
- `POST /projects/:id/imports/:job/apply`: commit reviewed fields and imported documents with optimistic project revision checks. Keep original project values when uncertain, and present conflicts.
- `DELETE /projects/:id/dropbox/connection`: revoke/discard the connection and stop future scans. Preserve previously imported project files unless the user deletes them separately.

## Files and AI extraction

Store imported originals in private Cloudflare R2 keys partitioned by tenant/project, with authorized downloads. Save metadata and provenance separately: provider file ID, revision, original path/name, hash, importer, timestamp, extraction model/version, page/section citations, confidence and decision state. Photos get separate derived display thumbnails; originals remain available. Do not use public R2 links for client documents.

Plans route through the existing supported PDF/DXF import. DWG requires a conversion service or a CAD-exported PDF; it must not be advertised as natively supported. Choose the base revision explicitly before replacing an active trace. Match guideline documents to the actual project HOA/address. Proposal fee candidates go to Financials; address/contact candidates go to Project info; guidelines go to Site requirements; photos/references go to the shared collection.

For ongoing scanning, use persisted Dropbox cursors and provider changes. Deduplicate by file ID/revision and content hash; avoid duplicate uploads on retries. User-configurable automatic import can add photos/documents. Changed fees, addresses, requirements and base drawings should present the source and existing value for review.

## Acceptance checks

Verify cross-tenant/project isolation, state replay rejection, expired/revoked connection behavior, folder boundary enforcement, duplicate and retry handling, concurrent edits, scan cancellation, supported/unsupported CAD formats, malicious instructions in documents, file size/type validation and visible source citations. Test the account feature separately from the existing V1 services.

## Primary references

- Dropbox developer guide: https://docs.dropboxapi.com/dropbox-api/docs/developer-resources/developer-guide
- Dropbox offline OAuth: https://dropbox.tech/developers/using-oauth-2-0-with-offline-access
- Dropbox scoped authorization: https://dropbox.tech/developers/customizing-scopes-in-oauth-flow
