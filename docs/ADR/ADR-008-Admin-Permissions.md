# ADR-008: Admin permissions are pinned by environment variables

> Status: Accepted · Last updated: 2026-11-01

## Context

A database "role" column can be edited by a bug or a bad write. Admin power should not depend on user-editable data.

## Decision

A user is an admin only if their e-mail is in `ADMIN_EMAILS`. When `ADMIN_USER_IDS` is also set, the Catalyst user id must be listed too ("pinned"), so a re-registered or look-alike e-mail cannot gain access. `GET /admin/me` tells a listed but unpinned admin their own user id to copy into the variable. Non-admins get `403` on everything under `/admin`.

There is a single admin level today (no super/sub split).

## Consequences

Changing admins means editing `catalyst-config.json` and deploying. Per-module permissions are Planned, not built.
