# Managed email login — activation plan

Status: Cloudflare Zero Trust Free activated by owner. Dedicated /login application and owner-only policy configured in dashboard; One-time PIN selected as sole identity provider. V2.057 integration passed Chrome and Firefox fixture tests; live owner code verification remains required.

## Intended behavior

- Owner: warwickphunt@gmail.com, mapped to existing `studioh` / `studio-admin` workspace.
- Cloudflare Access provides email one-time codes, without a new mail sender/domain.
- Protect only the dedicated login route, never blanket-protect the JSON API (which would break cross-origin API preflights).
- Validate Access JWT cryptographically against pinned team issuer, application audience and trusted signing keys. Reject expired tokens, forged email headers and uninvited users.
- Use same-tab sign-in and a short-lived, single-use app handoff. Do not depend on popup opener, third-party cookies or a cached root HTML document.
- Keep project authorization on the server for every read/write. Public demo remains separate.
- Keep existing recovery access until normal sign-in is proven; then retire recovery UI.

## Activation and verification

1. Owner signs in to Cloudflare dashboard. Enable Access and review any plan/terms before accepting.
2. Configure email OTP and allow owner email for the login route. Record issuer/audience.
3. Implement and test server session exchange and first-party remembered login.
4. Verify bad signature, wrong audience, expiry, code replay, uninvited address, viewer write denial and revoked access.
5. Test live email delivery and owner login. Verify existing cloud project load, save/reload and new-tab access; test iPad path before declaring resolved.
6. Do not deploy a missing-provider form, direct users to a demo for owner editing, or claim fixture tests prove live login.

## Incident evidence

- Recovery ticket was redeemed at 2026-09-29T03:39:55.214Z; screenshot afterward showed authorize page. Exact client handoff failure remains unconfirmed.
- A diagnostic live recovery session returned HTTP 200 from /session and owner identity. Diagnostic session was revoked immediately after the check. No project data was changed by that check.
- Published root HTML and cloud.js show V2.056, but the user's cached document was not observable.

## Configuration
- Application: f5ad8fa3-66c5-4ce9-bb1a-5bf0675e42ee
- Team: lively-sunset-dd9a.cloudflareaccess.com
- Authentication only is remembered in browser storage; project data remains server-authoritative. Login session keys are excluded from backup migration/preferences.
- Sign-in handoff uses a two-minute, one-use code bound to a browser-held verifier and state. No persistent session credential is put in the redirect URL.

## V2.058 account flow

Password login uses `@noble/hashes` scrypt, N=16384/r=8/p=5, random per-password salt; plaintext passwords are never stored. Parameters follow https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html .

Create account / password recovery first verifies email through the existing signed Cloudflare Access handoff, then accepts name and password in Studio H. Setup requires a recent verified session; password login alone cannot set a new password. Credential version rotation invalidates prior sessions. Login attempts are rate limited by address and IP.

Owner email retains the `studioh` account and existing projects. Uninvited verified users receive `user-<email hash>` account storage. Browser backup recovery is restricted to the original studio owner and is never automatic for new accounts. Signed-out users see the login gate; signed-in users choose a project before the workspace boots. Visible Account menu includes identity, projects, password setup/reset and sign out.

Verification: ten backend tests; Chrome/Firefox account flow with fixture-signed identities; new-user empty workspace, project creation/save and password recovery browser test; scrypt compatibility tested in workerd locally and an inactive deployed Cloudflare version. These tests do not replace the owner's real email-code/password entry.

Public registration activation requires saving the Cloudflare policy to Include Login Methods / One-time PIN. App scope remains `/login` only. Warwick chose owner-only registration on September 28. Keep PUBLIC_ACCOUNTS=false and the existing owner-email policy unchanged. Account quotas remain subject to the current Cloudflare plan.

### Publication status
Backend deployed: version `47dc768b-8949-43b0-bb79-45adf4b82914`; live `/auth/config` confirms `passwordLogin:true`, `managedLogin:true`, `registration:false`. Existing Cloudflare owner-email policy is unchanged; unsaved broader rule discarded.

V2.058 frontend is built and tested locally but NOT pushed. Automatic approval review rejected committing/pushing authentication source to the PUBLIC `DesigningLA27/studioh-estimator` repository after the user raised copying concerns. User has been asked to choose private source hosting preparation or explicitly approve the existing public publication. Do not retry or route around that block. The public frontend remains V2.057 until resolved. Do not make the GitHub repository private without preparing and verifying replacement hosting, because that could interrupt GitHub Pages.

## Controlled demo access — deployed 2026-09-28
- Live private-hosted app: https://studioh-v2-storage.warwick-cca.workers.dev/app/ (V2.058).
- Worker version e63e303f-0b2f-44a1-82c9-20ca59439383, prior rollback version 47dc768b-8949-43b0-bb79-45adf4b82914.
- Registration remains owner-only; Cloudflare Access policy unchanged. Owner creates password through email verification. Actual owner password setup has not been completed by agent.
- Owner Account > Demo logins creates expiring demo usernames/passwords and revokes access. Demo workspace is session-only sample data, cannot read/write private projects.
- Tests: 12 backend cases passed, private-host account/save/reset browser test passed, Chrome and Firefox demo + moodboard builder tests passed. Production login UI verified; production anonymous engine denied (401), registration false.
- Private staging embeds sandboxed presentation assets in authenticated engine so opaque iframe needs no cookie-bearing nested requests.
- Older GitHub sign-in callbacks retained for existing frontend compatibility.
- No public GitHub push: automatic approval review blocked publishing new source given user's copying concern. Existing public repository remains public and must be addressed separately; cannot promise browser-delivered code is uncopyable.
- V1 parity work remains per v1-v2-feature-parity.md; route smoke checks do not mean all workflows/services migrated.
