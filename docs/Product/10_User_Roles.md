# User Roles

> Status: Draft · Owner: TBD · Last updated: 2026-08-31

## Purpose

Document the user-role distinctions that actually exist in code today.

## Scope

- Covers: role distinctions evidenced by the app/feature structure
- Does not cover: a formal permissions matrix (see `11_Permissions_Matrix.md`
  and `docs/Security/RBAC.md` — that level of detail isn't decided yet)

## Details

Three top-level roles are evidenced in the codebase:

| Role | Where it lives | Evidence |
| --- | --- | --- |
| **Client** | `apps/web`, `features/dashboard-client/` | Separate dashboard feature, own layout (`ClientDashboardLayout`), own section set (orders, invoices, wallet, messages) |
| **Professional** | `apps/web`, `features/dashboard-professional/` | Separate dashboard feature, own layout (`ProfessionalDashboardLayout` / `ProfessionalActiveDashboardLayout`), own section set (available jobs, my tasks, earnings) |
| **Admin** | `apps/admin`, `features/admin-dashboard/` | Further split into `"super"` and `"sub"` sub-roles — see `docs/Security/RBAC.md` |

Client and professional are modeled as **separate features**, not a single
"dashboard" with a role flag — see `apps/web/AGENTS.md`: "don't merge them
to reduce duplication; the two roles have different permissions and data
shapes."

Admin has two sub-roles (`"super"` / `"sub"`) read from Supabase
`app_metadata.role`, currently only gating nav visibility (see
`docs/Security/RBAC.md` for why that's UI-only, not enforcement).

## Open Questions

- [ ] Whether a user can hold more than one role (e.g. be both a client and
      a professional) isn't evidenced either way in the current structure
- [ ] No formal permissions matrix exists yet (see `11_Permissions_Matrix.md`)

## References

- `apps/web/src/features/dashboard-client/`, `dashboard-professional/`
- `apps/admin/src/features/admin-dashboard/`
- `docs/Security/RBAC.md`
