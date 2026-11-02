# Git Workflow

> Status: Active · Last updated: 2026-11-01

## Enforced locally (`.husky/`)

- `commit-msg`: Conventional Commits (`feat|fix|docs|chore|refactor|test|ci|build|perf`, optional scope).
- `pre-commit`: `pnpm check:structure` then `pnpm lint`.

## Enforced in CI (`.github/workflows/`)

`ci-web`, `ci-admin`, `ci-api` (typecheck + build/tests, structure check), `test` (`pnpm test`), `lint` (ESLint + Prettier), `database` (typecheck of the database package), `security-scan` (weekly `pnpm audit`, CodeQL, secret scan). Deploy workflows (`deploy-*`, `preview-deploy`, `publish-sdk`) are manual-only and still point at Vercel; deploys to Catalyst are done by hand (see DevOps/64_Deployment.md).

## Policy

Branches `feat/*`, `fix/*`, `docs/*`, `chore/*`; open a PR; run `pnpm lint`, `pnpm typecheck` and `pnpm test` first. Never rewrite pushed history (the repo is synced with Lovable).
