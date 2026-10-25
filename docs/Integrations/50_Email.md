# Email

> Status: Draft · Owner: TBD · Last updated: 2026-08-31

## Purpose

Document the actual state of email integration — currently
**scaffolding only, not a live integration**.

## Details

- `apps/api/.env.example` declares `RESEND_API_KEY` — the name is
  reserved, but no code in the repo actually calls the Resend API.
- `apps/admin`'s settings screen (`system.tsx`) displays `"Resend"` as a
  configured provider — this is static display data, not a live connection.
- **No email flow is actually wired to a provider yet, including password
  reset.** `apps/web/src/pages/ForgotPassword.tsx` currently simulates the
  send with a local delay (`await new Promise((r) => setTimeout(r, 800))`)
  and a comment noting it should call Supabase's
  `auth.resetPasswordForEmail`/`updateUser` "once a backend is wired up" —
  that real call has not been made yet. (A prior audit note in
  `UX_INTEGRITY_AUDIT.md`, dated 2026-08-28, claimed this was already wired
  to Supabase; that claim does not match the code as it exists now —
  verify directly against the file rather than trusting either this doc or
  that one.)
- No transactional email (order confirmations, invoices, notifications) is
  wired to any provider yet either.

## What this means

**Nothing email-related is live yet** — not password reset, not
transactional email. Resend is reserved as the likely provider via the
env var name, but no code calls it, and the one flow that looks like it
might be closest to working (password reset) is still a local simulation.

## Open Questions

- [ ] Whether Resend is a firm decision or just the first name reserved in
      `.env.example`
- [ ] Which transactional emails are needed first (order lifecycle
      notifications are the most likely candidate, given `OrderStatus`'s
      many states — see `docs/Product/12_State_Machines.md`)

## References

- `apps/api/.env.example`
- `apps/web/src/pages/ForgotPassword.tsx`
- `UX_INTEGRITY_AUDIT.md`
