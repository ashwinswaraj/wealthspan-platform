# @wealthspan/sdk

Public SDK package — the only thing in this monorepo meant to be consumed
by *external* code outside the Wealthspan apps themselves (integration
partners, third-party tooling). Everything else under `packages/` is
internal-only (`"private": true` and workspace-scoped).

## Current state

Placeholder. `package.json` already declares `"private": true`, version
`0.0.0`, with `main`/`types` pointing at `src/index.ts` — but no real SDK
surface exists yet (`src/index.ts` just exports `{}`, with a comment
explaining it exists to make the declared entry point resolvable, not as
finished functionality). `CHANGELOG.md` is empty for the same reason —
nothing has shipped yet.

## Before publishing publicly

- `[SEC]` Audit every export for anything that leaks internal-only types,
  routes, or assumptions from `apps/api` — this package's surface is a
  public contract the moment it ships, unlike everything else in
  `packages/`, which can change freely inside the monorepo.
- `[SCALE]` Adopt semver properly at that point (flip `private` to `false`,
  start real version bumps) and start filling in `CHANGELOG.md` per
  release — don't backfill history after the first breaking change ships.
- `[RULE]` Decide and document the publishing pipeline (which registry, who
  can publish, what triggers a release) before the first real version goes
  out — this is a one-way door once external consumers depend on it.

## Rules

- `[RULE]` Never depend on this package from another package inside the
  monorepo (`apps/*` and other `packages/*` should get the same
  functionality from the internal package directly, e.g. `@wealthspan/types`,
  not by routing through the public SDK) — that would make an internal
  change accidentally a public breaking change.
