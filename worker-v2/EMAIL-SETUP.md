# Email access activation

Public demo: `/v2/?demo=1`. It boots only the bundled sample into memory; it never opens cloud projects, imports browser backups, or saves to the server.

Private email access requires these worker settings, currently intentionally unset:

- `OWNER_EMAIL`: Warwick's verified owner address. Maps to the existing `accounts/studioh` workspace and `studio-admin` preferences. Never choose the owner from the first public signup.
- `AUTH_FROM`: a sender address on a verified sending domain.
- `RESEND_API_KEY`: sending-service secret. The adapter uses Resend's `/emails` API. Alternatively bind `MAILER` to an internal service implementing the same JSON contract.

Never put delivery credentials in frontend code or Git. Configure the owner only after Warwick supplies the address. Until configured, email sign-in and invitations stay unavailable; public demo and existing owner sessions work. Collapsed Owner recovery preserves existing admin access.

Codes expire after ten minutes, allow five guesses, and are atomically consumed once. Address/IP rate limits apply. Sessions last thirty days. Every project read/upload/save checks current access; revocation blocks existing sessions on their next request. Sharing is owner-only and appears once delivery is configured.

Before activation, run worker and browser access tests, then send an authorized verification email to the owner and verify on a second device. Fixture tests send no real email.

Provider reference: https://resend.com/docs/api-reference/emails/send-email
