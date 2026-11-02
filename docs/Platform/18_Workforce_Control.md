# Admin Team & Roles

> Status: Planned (single super admin today) · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

Who on the Wealthspan team may operate the system.

## Today

There is one tier: super admin. A person is an admin if their email is in `ADMIN_EMAILS` and, when `ADMIN_USER_IDS` is set, their Catalyst user id is listed too (`createAdminService`). There are no sub-admin roles in code.

## Planned

Support and finance roles with per-module permissions. Design is in `docs/Admin/122_Admin_Roles.md`, `123_RBAC.md` and `124_Module_Permissions.md`. Nothing here is built yet.
