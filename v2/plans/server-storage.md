# V2.049 server saving

The current interface uses the existing studioh-v2-storage Worker and private studioh-v2-private R2 bucket. V1 code and services are unchanged. Connect Studio H authenticates through the existing publishing-key flow. This release serves the studio administrator; individual designer/client identities and project sharing are not implemented.

Project state, presentation layouts, uploaded documents and image data, private catalog changes, workspace notes, and preferences save through authenticated requests. Large library and snapshot data blocks are compressed into private content-addressed objects, avoiding repeated multi-megabyte writes. Embedded media becomes private raw objects referenced by project records; external links remain links. Original uploads through Photos are retained alongside resized previews. Files are limited to 50 MB each. Browser memory holds the working copy; public asset caching and the secure sign-in cookie are permitted. Prior browser backups are read for recovery and retained, never silently discarded. Newly verified recovery IDs are recorded on the server to avoid reopening an old backup on every login.

Saving uses server revisions, rejects stale updates, retains prior versions, and reports failures without a local persistence fallback. Project switching first captures the current engine state. A conflict offers a separate project copy. Save status must be checked before closing; unsaved changes trigger the browser leave warning.

The native browser storage object is replaced with a memory adapter before application startup. Shell preferences are loaded before the interface boots. The engine retains its opaque sandbox and its Maps-only network boundary; the parent owns authenticated storage. Public catalogs use a memory cache. Root V1 remains unchanged.

Validation: Worker account isolation, anonymous denial, media hashes, stale-revision rejection, history and session revocation; Chrome and Firefox fresh-context restore, preferences, navigation, moodboard editor, interrupted save retry, valid/incomplete migration. Live Cloudflare verification uses the isolated verification-20260925 owner, never user project records.

Not included: individual user invitations, Dropbox synchronization, copying every externally linked image, all-project downloadable archives, or AI assistant integration. The developer icon A/B test intentionally remains session-only.

## Startup correction (V2.051)

Returning sessions load the saved workspace before hydrating private media and large library blocks. Tool initialization waits for complete data, and saves are suspended until hydration succeeds. Repeated immutable asset references share one read; independent reads run concurrently with an eight-request limit. Engine code is prefetched while authentication runs. Static bundled reference images now use content-addressed public files instead of embedded base64; V1 source is unchanged.

A bearer session is retained in sessionStorage for same-tab reloads (never project data). It is validated on every startup and cleared on expiry or logout. A new tab without a session or existing authorized publishing key still requires sign-in. A first-paint opening state prevents the obsolete preview layout from flashing. Existing server projects skip all legacy browser recovery scans; explicit recovery remains in Settings. First connection without a server project still attempts recovery.

Regression coverage includes a deliberately stalled private asset: the workspace opens, no incomplete project is written, duplicated assets load once, and full data arrives before the editor becomes ready. Chrome and Firefox verify automatic same-tab reconnect. Timing on the isolated real Cloudflare test project: old full startup approximately 33 seconds; revised workspace approximately 1 second and all project tools approximately 9–13 seconds. These are test measurements, not a guarantee for every connection or project.
