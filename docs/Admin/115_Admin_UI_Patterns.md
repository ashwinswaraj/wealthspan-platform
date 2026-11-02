# Admin UI Patterns

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

- **Stat card**: label, value, note, footer (Overview, Security).
- **Review action**: approve or reject with note (Subscriptions & Billing).
- **Derived alerts**: header bell built from pending payments and failing services.
- **Polling**: health refetches every 30 s; other data loads on demand through TanStack Query hooks in `adminApi.ts`.
- **Honest states**: dash for missing, "Not available yet", "Local only".
