# Dashboard (Overview)

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

Health of the business at a glance.

## Data (`GET /admin/overview`)

Users, users by plan (Free, Go, Pro), projects, transactions, MRR (monthly-equivalent of live Pro subscriptions, in paise), pending payments, and a 30-day new-users trend. Implemented in `createAdminService().overview()`.
