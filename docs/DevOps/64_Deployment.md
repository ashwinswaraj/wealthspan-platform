# Deployment

> Status: Draft · Last updated: 2026-11-01

Target: Zoho Catalyst, India data centre (`--dc in`). Deploys are manual; the `deploy-*` GitHub workflows are `workflow_dispatch` only and still reference Vercel, so they are not used.

## Steps

1. `pnpm install`, then `pnpm test` and `pnpm typecheck`.
2. `pnpm --filter @wealthspan/api build:catalyst` if anything under `apps/api/src` changed (regenerates `functions/*/index.js`; commit it).
3. From the repo root: `pnpm build:client` (static builds of web for `/app/` and admin for `/app/admin/`, placed in the Catalyst `client` folder by the build-static scripts).
4. From `apps/api/catalyst`: `catalyst deploy -p <project> --dc in`.
5. Re-set `SARVAM_API_KEY` in the Catalyst console. A deploy wipes any function env var that is not in that function's `catalyst-config.json`; only non-secret values (`ADMIN_EMAILS`, `ADMIN_USER_IDS`, `NODE_ENV`) belong there.
6. Smoke test: log in, add a transaction, open a chat, export a file, open `/app/admin/` as an admin.

Functions: `finance`, `chat`, `files` (Node 22, Advanced I/O, 30 s limit). Production Data Store is created by promoting Development.
