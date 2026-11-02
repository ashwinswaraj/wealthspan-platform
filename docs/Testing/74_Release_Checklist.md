# Release Checklist

> Status: Draft · Last updated: 2026-11-01

- [ ] `pnpm check:structure`, `pnpm lint`, `pnpm typecheck`, `pnpm test` pass; CI green.
- [ ] `pnpm --filter @wealthspan/api build:catalyst` run and `functions/*/index.js` committed.
- [ ] `pnpm build:client`, then `catalyst deploy -p <project> --dc in` from `apps/api/catalyst`.
- [ ] `SARVAM_API_KEY` re-set in the console; `ADMIN_EMAILS` and `ADMIN_USER_IDS` correct.
- [ ] Data Store schema matches [42](../Database/42_Catalyst_Data_Store_Schema.md) in the target environment.
- [ ] QA checklist done; smoke test on the live URL (`/app/` and `/app/admin/`).
- [ ] Legal drafts reviewed by a lawyer before public launch.
- [ ] Rollback: redeploy the previous commit's build.
