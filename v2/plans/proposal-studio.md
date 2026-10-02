# Proposal studio — V2.104

Proposals are studio-level records, independent of projects. Across the studio → Proposals and the signed-in entry chooser both open `/app/assets/proposals/`. Layout A is the default; B/C are retained. Blank proposals contain no invented fees. The explicit sample uses fictional prospects and verified 2024 catalogue prices.

## Implemented
- Private administrator-authorized `/proposals` records, conditional revision saves, history, duplicate, archive/restore, reusable templates.
- Approved document layouts, editable sections, complete editable legal/exclusion text, template library, draft print/PDF.
- One shared eight-step agreement view renderer with the project billing setup; independent draft state. Existing project billing stays unchanged.
- Rate-sheet suggestions, explicit allocation to phases, historical comparison, site-condition review suggestions. No automatic scope additions. Default billing rates inherit studio settings and can be overridden.
- Private PDF/DOCX upload and AI evidence extraction via existing AI service. Explicit review creates a new draft; source remains retained. No automatic legal approval. Live provider extraction still needs a real-source acceptance check; mocked service integration is tested.
- Mandatory construction cap and explicit missing-data checks; legal placeholders and pricing exceptions block readiness. Internal hours/cost allowances do not enter the allowlisted client document.
- Retain an externally executed PDF with signer/date attestations, immutable structured snapshot and PDF checksum. This is recordkeeping, NOT a built-in signing certificate or signature ceremony.
- Explicit project creation from a recorded executed proposal, deterministic ID for retry safety, carries client/property plus scope/fees/billing into private financials. Signed original remains intact.

## Signing decision still pending
Sending, client portal authentication/downloads, native consent/identity verification, signature evidence, sealed PDF and provider webhooks are not enabled. Do not claim that recording an existing PDF authenticates a signature. Native signing is technically possible but needs an evidence design and legal review; embedded provider remains recommended. No real invitations sent.

## Validation
Proposal and financial tests cover private access, cross-studio isolation, revision conflicts, immutable signed records, missing caps, costs omitted from client payload, AI extraction without implicit mutation, and idempotent project creation. Browser checks cover sample save/reload, all eight setup steps, switches, desktop and 1024px iPad geometry. Knowledge test fixture requires running build-private-app.py first.
