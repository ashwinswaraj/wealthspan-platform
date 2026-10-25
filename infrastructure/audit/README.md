# Audit logging infrastructure

`[SEC]` Tracks who did what, when, to sensitive/admin data — the mechanism
that makes `apps/admin`'s privileged actions (approve, ban, refund,
override, role changes) reviewable after the fact, not just possible.

## Status

Not yet implemented. This folder exists now (rather than being added later)
because every new admin mutation should be built with audit logging in
mind from the start, not retrofitted — see `apps/admin/AGENTS.md`.

## Intent, once implemented

- Every mutating action inside `apps/admin/src/features/admin-dashboard/`
  should emit an audit event: actor (admin user), action, target
  entity/id, timestamp, and — where relevant — the before/after values.
- Audit records are append-only: no admin action, including one performed
  by a super-admin, should be able to edit or delete a past audit entry.
- Reads of audit data are themselves privileged and should be logged too.

## Related

- `docs/Admin/104_Audit_&_Logs.md` — product-level spec (currently draft)
- `docs/Security/Incident_Response.md` — how audit data feeds an incident
  investigation (currently draft)
- `packages/database/` — audit tables/schema will live in a migration
  here once defined (see `infrastructure/database/AGENTS.md`)
