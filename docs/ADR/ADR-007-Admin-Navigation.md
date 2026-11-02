# ADR-007: Admin screens only show what the API serves

> Status: Accepted · Last updated: 2026-11-01

## Decision

The admin panel's sections (`dashboard`, `finance`, `subscriptions`, `security`, `system` in `features/admin-dashboard/components/sections/`) read from `/admin/*`: overview, users, payments (approve/reject), ledger, audit, health. No section is added for a feature the API does not serve. Planned screens (support and refunds, data-quality review) stay out of the navigation until their API exists.

## Consequences

Navigation cannot show dead screens. A new admin area needs its API route first.
