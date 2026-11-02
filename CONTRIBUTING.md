# Contributing to Wealthspan

## Branching
- `main` — production
- `develop` — integration
- `feat/*`, `fix/*`, `docs/*`, `chore/*`

## Commits
Conventional Commits: `feat(sheets): add loan EMI column`

## Workflow
1. Fork/branch from `develop`
2. Keep changes scoped; update relevant docs in `docs/`
3. Run `pnpm run build` and lint before opening a PR
4. Fill the PR template and request review

## Code standards
- UI must come from `@wealthspan/ui/design-system` (see `packages/ui/src/design-system/README.md`)
- Brand blue is flat `#004AC6` — no gradients, no other blues
