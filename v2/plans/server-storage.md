# V2.049 server saving

The current interface uses the existing studioh-v2-storage Worker and private studioh-v2-private R2 bucket. V1 code and services are unchanged. Connect Studio H authenticates through the existing publishing-key flow. This release serves the studio administrator; individual designer/client identities and project sharing are not implemented.

Project state, presentation layouts, uploaded documents and image data, private catalog changes, workspace notes, and preferences save through authenticated requests. Large library and snapshot data blocks are compressed into private content-addressed objects, avoiding repeated multi-megabyte writes. Embedded media becomes private raw objects referenced by project records; external links remain links. Original uploads through Photos are retained alongside resized previews. Files are limited to 50 MB each. Browser memory holds the working copy; public asset caching and the secure sign-in cookie are permitted. Prior browser backups are read for recovery and retained, never silently discarded. Newly verified recovery IDs are recorded on the server to avoid reopening an old backup on every login.

Saving uses server revisions, rejects stale updates, retains prior versions, and reports failures without a local persistence fallback. Project switching first captures the current engine state. A conflict offers a separate project copy. Save status must be checked before closing; unsaved changes trigger the browser leave warning.

The native browser storage object is replaced with a memory adapter before application startup. Shell preferences are loaded before the interface boots. The engine retains its opaque sandbox and its Maps-only network boundary; the parent owns authenticated storage. Public catalogs use a memory cache. Root V1 remains unchanged.

Validation: Worker account isolation, anonymous denial, media hashes, stale-revision rejection, history and session revocation; Chrome and Firefox fresh-context restore, preferences, navigation, moodboard editor, interrupted save retry, valid/incomplete migration. Live Cloudflare verification uses the isolated verification-20260925 owner, never user project records.

Not included: individual user invitations, Dropbox synchronization, copying every externally linked image, all-project downloadable archives, or AI assistant integration. The developer icon A/B test intentionally remains session-only.
