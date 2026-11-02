# Users Directory

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

Find a user and see their plan.

## Data (`GET /admin/users`)

Name, email, short code `WSP-xxxxx`, role (Super Administrator or Standard User), plan (Free, Go, Pro), plan validity, active-since date, status (Active or Suspended). Search by name, email or code; CSV download (`usersDirectory.tsx`).

Suspend, plan override and user-detail actions are not wired to the API (Planned).
