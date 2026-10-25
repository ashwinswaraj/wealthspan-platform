# Git Workflow

> Status: Active · Owner: TBD · Last updated: 2026-08-31

## Purpose

Document what's actually enforced by tooling in this repo, vs. what's
policy-only, so contributors know which rules will block them mechanically
and which rely on review discipline.

## Enforced by `.husky/` (mechanical, will block you)

- **`commit-msg`**: every commit message must match Conventional Commits —
  `(feat|fix|docs|chore|refactor|test|ci|build|perf)(scope)?: message`.
  A non-conforming message is rejected at commit time.
- **`pre-commit`**: runs `pnpm lint` before every commit.

## Policy (from `CONTRIBUTING.md`, not mechanically enforced)

- Branch naming: `feat/*`, `fix/*`, `docs/*`, `chore/*`
- `main` = production, `develop` = integration
- Run `pnpm build` and lint before opening a PR; fill the PR template

## CI status

`.github/workflows/lint.yml` is currently a placeholder
(`# TODO: enable when needed`) — lint is enforced locally via the
pre-commit hook, not yet in CI. The other workflows
(`ci-web.yml`, `ci-admin.yml`, `ci-api.yml`, `test.yml`, `database.yml`,
`security-scan.yml`, `deploy-{staging,production}.yml`, `preview-deploy.yml`,
`publish-sdk.yml`) are similarly scaffolded but not yet wired to real steps —
confirm current state before assuming any of them run real checks.

## References

- [Master Context](../00_Master_Context.md)
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md)
- `.husky/commit-msg`, `.husky/pre-commit`
