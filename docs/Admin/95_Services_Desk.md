# Plans & Catalog

> Status: Partly built · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

Define plans and see the catalog.

## State

- Subscriptions screen shows the plans from `PLANS` (trial, `pro_monthly` Rs 199, `pro_annual` Rs 1,999) with edit and delete controls. Edit saves the plan's name, price and days to the `plan_settings` table (`PUT /admin/plans/:id`); payments and renewals use the saved values at once, and the defaults in `apps/api/src/features/subscription/types.ts` apply until an admin saves. New plans and deleting plans are not supported (the three plan ids are fixed).
- Per-user catalog records (projects, accounts, events, loans, investments) are not browsed from admin; only counts of projects and transactions appear.

Planned: persist plans in the Data Store and edit them from here.
