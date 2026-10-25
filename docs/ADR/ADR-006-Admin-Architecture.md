# ADR-006: apps/admin dashboard kept as one feature, not split per domain

> Status: Accepted, revisit-eligible · Last updated: 2026-08-31

## Status

Accepted (2026-08-31), explicitly open to revisiting — see Open Questions.

## Context

`apps/admin`'s entire dashboard (~20 files: finance, disputes, security,
workforce, roles, audit, order-desk, QA, and more) lived in a flat,
type-driven `components/dashboard/` folder. Per ADR-001, this needed to
move into `features/<domain>/`. The question was whether to treat it as
one feature (`admin-dashboard`) or split it into several
(`finance`, `security`, `workforce`, etc.).

## Decision

Consolidate into **one** feature, `features/admin-dashboard/`, rather than
splitting per business domain.

Reasoning:
- Every section cross-imports shared state and UI atoms
  (`sections-shared.tsx`, `sections/shared.tsx`) with no independent
  public API per section.
- Several files (`GlobalSearchOverlay`, `usersDirectory`, `AuditListPage`,
  `SortDropdown`) are each used by *multiple* sections that would end up
  in different "features" under a split — that would mean inventing
  cross-feature imports, working against feature isolation rather than
  achieving it.
- Splitting requires real ownership boundaries (who owns finance vs.
  security vs. workforce as a team matter), which isn't something to infer
  from code alone.

## Consequences

- **Positive**: gets the code out of a generic, type-driven bucket into a
  real domain name, satisfying the barrel/feature pattern, without
  inventing unverifiable sub-boundaries.
- **Trade-off**: the feature is large (~20 files) compared to every other
  feature in the repo. `pages/dashboard/admin/Dashboard.tsx` mitigates the
  bundle-size consequence via `lazy()` code-splitting on most sections
  (see `Import_Rules.md`), but the feature is still one unit for the
  purposes of ownership/review.
- **Follow-up found during this work**: two files
  (`billRegistry.ts`, `opsRegistry.ts`) were separately discovered
  misplaced in generic `lib/` and moved into this feature's own `lib/` —
  same class of issue as the feature-boundary problem this ADR addresses.

## Open Questions

- [ ] If/when real ownership boundaries are decided (e.g. a finance team
      distinct from a trust-and-safety team), this feature should be
      re-split along those lines — this ADR should be revisited, not
      treated as permanent
- [ ] `docs/Admin/122_Admin_Roles.md`, `123_RBAC.md`, `124_Module_Permissions.md`
      (still drafts) would likely inform where real boundaries lie

## References

- [Master Context](../00_Master_Context.md)
- `apps/admin/src/features/admin-dashboard/index.ts` (barrel, documents this reasoning inline too)
- `apps/admin/AGENTS.md`
- [`Decision_Log.md`](../Architecture/Decision_Log.md)
- `.lovable/plan.md`
