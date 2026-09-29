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
