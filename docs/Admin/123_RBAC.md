# RBAC

> Status: Planned · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Design

Roles map to permissions per module (`124_Module_Permissions.md`). The server enforces them on each `/admin/*` route; hiding UI is not security. The existing check (`isAdmin`: email allowlist plus optional pinned id) becomes the super-admin branch. Roles would be stored in the Data Store. Not built.
