# AGENTS.md — apps/api

Rules specific to this app. Falls back to root `AGENTS.md` for anything not
covered here.

## Current state

`apps/api` is the backend of Wealthspan: shared feature code in `src/` plus three Catalyst Advanced I/O
functions in `catalyst/functions/` (`finance`, `chat`, `files`; 30 s limit each). Identity is Catalyst
Authentication (session cookie, same domain); data is the Catalyst Data Store. Check
`catalyst/functions/*/src/entry.ts` to see which routes are really served.

## Rules

- `[RULE]` **One feature = one domain**, matching `AGENTS.md` §3:
  `controller.ts` (HTTP handling) → `service.ts` (external calls / business
  logic) → `types.ts` (shared shapes) → `routes.ts` (route map) →
  `index.ts` (barrel). See `features/auth/` for the reference shape.
- `[SEC]` **Never log or return raw secrets.** Every value in `.env.example`
  (`SARVAM_API_KEY`, `ADMIN_EMAILS`, `ADMIN_USER_IDS`) is server-only — none of them may reach
  a client response, a log line, or an error message. If you add a new
  secret, add its name (not its value) to `.env.example`.
- `[SEC]` **Never bypass the session check.** Every handler that reads
  user-scoped data must take the user from the Catalyst session
  (`features/auth`) — don't trust a `userId` passed in a request body.
- `[CLR]` Copy `.env.example` to `.env` before running anything locally;
  never commit `.env`.

## Never do without confirmation

- Add a new required environment variable without adding it to
  `.env.example` first
- Add a payment (`STRIPE_SECRET_KEY`) or notification (`RESEND_API_KEY`)
  integration call without confirming the provider/flow — these touch real
  money and real user contact info
