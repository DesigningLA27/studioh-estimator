# Server accounts — isolated development, V2.033-test.1

## Release boundary

Live V1 and V2.032 remain unchanged. Work is on `work/server-accounts-isolated`, based on production commit db39746. Do not merge or publish this branch as the live site. The frontend refuses to start outside localhost. Its storage endpoint is localhost:8788; its Worker has no production R2 bucket, account ID, or V1 service binding. Tests use synthetic accounts and an in-memory storage backend. No live customer data is used.

The previous admin publishing-key sign-in is NOT the intended subscriber account system. Automatic V1 credential reuse is removed. Without a test fixture binding, legacy sign-in returns an explicit unavailable response. Individual account sign-in must be completed before this can be a usable hosted test workspace.

## Product contract

- Server is authoritative for saved work. Clearing browser cache must not lose successfully synced data.
- Users sign in on another computer and receive their saved preferences and authorized projects.
- Browser caching is permitted for speed. Cache keys must include user, studio and project. Sign-out removes private cached data from shared devices. No cross-account cache reuse.
- Display Saving, Saved, Not synced, and conflict states truthfully. Never report Saved until the server acknowledges a revision.
- Optional offline work needs a durable, account-scoped pending queue with explicit Not synced status. This build does not yet provide durable offline edits.
- Browser recovery is copy-only during testing. Keep all original browser copies. Migration must not block opening a valid server project or silently replace its newer revision.

## Data ownership

| Scope | Content | Authorization |
|---|---|---|
| User | Theme, navigation/view preferences, dashboard layout, personal favorites | Authenticated user |
| Studio | Membership, subscription, business defaults, price/rule overrides | Studio admin or explicit grant |
| Project | Brief, trace, moodboard, selections, files, reference photos, project decisions | Assigned members |
| Client-visible project | Published options, approved estimate presentation, shared files and conversations | Invited client, explicit published fields |
| Public catalog cache | Published plant/product/material data | Public read; edits require separate authority |

The current prototype stores workspace settings together in project JSON. Before real accounts, split personal UI settings (pin, width, chosen view) from project collaboration state (tasks, messages, decisions). Never make financial scenarios or internal pricing personal preferences that accidentally travel between projects.

Developer/Designer/Customer preview controls remain UI previews. They must never grant server permissions. An admin user may administer their studio; a client may only receive explicitly shared project fields. Do not download the entire private project and merely hide fields in the client UI.

## Implementation and verification started

- Recovered server adapter only inside this isolated branch.
- Removed automatic use of V1 publishing credentials.
- Disabled live service/bucket bindings and restricted frontend host.
- Migration keeps source copies, including incomplete historical records.
- Recovery notice is contained inside the existing status bar, not inserted as a new child of the workspace grid. This addresses the extra grid row/short sidebar seen in V2.031.
- Regression covers synthetic account separation, revisions/conflicts, save failures, new-browser restore of project/media/preferences, incomplete legacy data, and navigation geometry at desktop and iPad sizes.

## Next gates, in order

1. Define managed identity provider, invitation flow and session architecture; use verified provider identity, not a shared publishing key. Create separate staging identity client and callback origin.
2. Implement studio membership and project grants, server-side role enforcement, client-safe response schema, revoked-session/access tests.
3. Separate user preferences from project/studio settings and verify two users in one firm do not change each other's preferences.
4. Add account-scoped read cache and explicit offline policy; test logout/account switching, cache eviction and reconnect.
5. Build an inspectable recovery inventory with copy/read-back verification, idempotency and explicit selection. Test representative older data; never delete during evaluation.
6. Host on a separate origin with a separate Cloudflare bucket and conspicuous Test workspace label. Provide a normal review link; production navigation does not change.
7. Verify all V1-derived routes, trace sources, three moodboard views, photos/files, five themes, roles, fresh/returning browsers, and iPad layouts against V2.032.
8. Review the staged experience before a deliberate production cutover. Keep V2.032 rollback available.

## Known remaining limitations

This is a development foundation, not completed login or server-only functionality. Live V2.032 still uses browser storage. This branch is not published; it cannot be used as a live server-saving release. Existing live Cloudflare records are untouched. Pending dependencies stay on this list until resolved.
