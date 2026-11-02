# CI/CD

> Status: Draft · Last updated: 2026-11-01

## CI (GitHub Actions, real)

- `ci-web`, `ci-admin`: structure check, typecheck, build.
- `ci-api`: structure check, typecheck, unit tests.
- `test`: `pnpm test` (constants, validation, utils, api).
- `lint`: ESLint + Prettier.
- `database`: typecheck of `packages/database`.
- `security-scan`: `pnpm audit` (high/critical), CodeQL, secret scan, weekly.

Run `pnpm check:structure` locally; it enforces the README folder tree.

## CD

None automated. Deploying to Catalyst is a manual CLI step ([64](64_Deployment.md)). Automating it needs a Catalyst CLI token as a GitHub secret and a decision on who may deploy to production; TBD.
