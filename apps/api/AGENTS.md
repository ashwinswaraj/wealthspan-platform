# AGENTS.md — apps/api

Rules specific to this app. Falls back to root `AGENTS.md` for anything not
covered here.

## Current state

`apps/api` is a **thin edge layer, not the system of record**. Identity is
handled by Supabase Auth directly — this app's `features/auth/` only
verifies bearer tokens and exposes the resolved session, it does not own
user data. `src/index.ts` is currently an unwired stub (`export {}`); no
HTTP framework is mounted yet. Don't assume routes are being served just
because a `features/<domain>/routes.ts` file exists — check `src/index.ts`
first.

## Rules

- `[RULE]` **One feature = one domain**, matching `AGENTS.md` §3:
  `controller.ts` (HTTP handling) → `service.ts` (external calls / business
  logic) → `types.ts` (shared shapes) → `routes.ts` (route map) →
  `index.ts` (barrel). See `features/auth/` for the reference shape.
- `[SEC]` **Never log or return raw secrets.** Every value in `.env.example`
  (`SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `STRIPE_SECRET_KEY`,
  `RESEND_API_KEY`, `DATABASE_URL`) is server-only — none of them may reach
  a client response, a log line, or an error message. If you add a new
  secret, add its name (not its value) to `.env.example`.
- `[SEC]` **Never bypass token verification.** Every handler that reads
  user-scoped data must go through the same bearer-token verification
  pattern as `features/auth/controller.ts` — don't trust a `userId` passed
  in a request body.
- `[SCALE]` Before adding a second feature, confirm the HTTP framework
  choice (see `.lovable/plan.md` step 1) — don't wire ad-hoc routing
  per-feature; use whatever framework gets chosen, consistently.
- `[CLR]` Copy `.env.example` to `.env` before running anything locally;
  never commit `.env`.

## Never do without confirmation

- Add a new required environment variable without adding it to
  `.env.example` first
- Add a payment (`STRIPE_SECRET_KEY`) or notification (`RESEND_API_KEY`)
  integration call without confirming the provider/flow — these touch real
  money and real user contact info
