# System

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Layout

- `apps/web`: TanStack Start SPA, hosted by Catalyst Web Client Hosting under `/app/`.
- `apps/api`: Catalyst Advanced I/O functions `finance`, `chat`, `files` (Express, Zod, bundled by `apps/api/catalyst/build.mjs`).
- Zoho Catalyst Data Store (ZCQL) for data; Cloud Scale Embedded Authentication for sign-in.
- AI: Sarvam `sarvam-105b`.
- Exports: `GET /files/export` (PDF, Excel, CSV, Word) and `GET /files/sheet`.
- Monorepo: pnpm + Turborepo.

Admin can see service health at `GET /finance/admin/health`.
