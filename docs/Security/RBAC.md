# RBAC (Role-Based Access Control)

> Draft — grounded in current code; the full role/permission matrix is
> still an open product decision, not something inferable from code alone.

## How role checks actually work today

The only implemented role check lives in `apps/admin`:

- A logged-in admin user carries a `role` field (from Supabase
  `app_metadata.role` — see `Auth_Flow.md`), observed values so far:
  `"super"` and `"sub"` (see
  `apps/admin/src/features/admin-dashboard/components/AdminDashboardLayout.tsx`).
- Navigation items can be marked `superOnly`; the nav list is filtered
  client-side with `NAV.filter((i) => !i.superOnly || user.role === "super")`.
- This is currently the **only** role-gating mechanism in the repo —
  `apps/web` has no equivalent role check yet (client vs. professional
  dashboards are separate features, but not gated by a `role` field the
  same way).

## What this means in practice

- `[SEC]` This is a **client-side UI filter, not an authorization
  boundary**. Hiding a nav item doesn't prevent a `"sub"` admin from
  reaching a `super`-only action if nothing server-side also checks the
  role — and `apps/api` doesn't check roles at all yet (only verifies
  *that* a token is valid, not *what* the resulting user is allowed to do).
  Treat any `superOnly` UI gate as UX only until a matching server-side
  check exists.
- There is no formal permissions matrix (which role can do which specific
  action, module by module) — only this one binary `super`/`sub`
  distinction, and only in the admin nav.

## Open Questions

- [ ] Full role/permission matrix per admin module — this is a product
      decision (see `docs/Admin/122_Admin_Roles.md`,
      `docs/Admin/123_RBAC.md`, `docs/Admin/124_Module_Permissions.md`,
      still drafts) — not something this doc should invent
- [ ] Server-side enforcement of role checks in `apps/api`, once it has
      more than the `auth` feature
- [ ] Whether `apps/web` needs its own role dimension beyond
      client/professional feature separation

## References

- `apps/admin/src/features/admin-dashboard/components/AdminDashboardLayout.tsx`
- `docs/Security/Auth_Flow.md`
- `apps/admin/AGENTS.md`
