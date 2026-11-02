# AGENTS.md — apps/admin

Rules specific to this app. Falls back to root `AGENTS.md` for anything not
covered here.

## Current state

Almost all business logic lives in one consolidated feature,
`src/features/admin-dashboard/` (users, subscriptions, payments, plans,
roles, security, audit, system, and more), not split per-domain —
see root `AGENTS.md` §9.2 for why, and don't split it further without
confirming ownership boundaries with a human first. `src/components/` is
intentionally near-empty (just `.gitkeep`) — it's reserved for UI genuinely
shared across *future* features, not a place to put new admin-dashboard
code.

`src/pages/dashboard/admin/Dashboard.tsx` lazy-loads most
`admin-dashboard` sections for route-level code-splitting — see root
`AGENTS.md` §3 before changing how these are imported.

## Rules

- `[SEC]` This app is the **highest-privilege surface in the repo** —
  every page here assumes an authenticated super-admin. Never relax an
  auth/role check to "make something work"; if a check is blocking a
  legitimate change, that's a sign to look at the role/permission model,
  not to remove the check.
- `[SEC]` Actions here are audited (see `infrastructure/audit/`). Any new
  mutating action (approve, ban, refund, override) should emit an audit
  event the same way existing ones in `features/admin-dashboard/` do —
  don't add a silent mutation path.
- `[RULE]` New admin functionality goes inside
  `features/admin-dashboard/components/` (or a new sibling feature, if it's
  genuinely independent — confirm first), never as a new top-level file
  under `src/components/` or `src/pages/`.
- `[CLR]` `docs/Admin/` has a numbered spec per module (90–124) — check for
  an existing spec before designing new admin UI/flows from scratch.
- `[SCALE]` `usersDirectory.tsx`, `GlobalSearchOverlay.tsx`, `SortDropdown.tsx`,
  and `AuditListPage.tsx` are cross-referenced by multiple sections inside
  `admin-dashboard` — changing their exported shape has a wide blast
  radius inside this one feature; grep for all usages first.

## Never do without confirmation

- Change what counts as a super-admin (role checks, permission gates)
- Add a new admin action that mutates data without an audit trail
- Import anything from `apps/web` (the reverse already happens — see root
  `AGENTS.md` §6 — don't add a second instance of cross-app coupling)
