# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/), versioning per [SemVer](https://semver.org/).

## [Unreleased]

### Changed

- Restructured the monorepo into `apps/{web,admin,api}` + `packages/*` +
  `infrastructure/`, each app's `src/` following a `features/<domain>/`
  pattern with barrel exports (see `ARCHITECTURE_RATIONALE.md` and root
  `AGENTS.md`)
- Consolidated `apps/admin`'s flat `components/dashboard/` into one
  `features/admin-dashboard/` domain
- Split `apps/web`'s flat `components/`/`pages/`/`lib/` into
  `features/{projects,sheets,wealthspan-auth,wealthspan-shell}/`
- Root `dev` script scoped to `apps/web` only
  (`turbo run dev --filter=@wealthspan/web --`) — `web` and `admin` currently
  share a default dev port; see `.lovable/plan.md`
- Upgraded pinned `@tanstack/{react-start,react-router,router-plugin,react-query}`,
  `@lovable.dev/vite-tanstack-config`, and `nitro` versions in `apps/web`
  and `apps/admin` to fix a fatal `matchedRoutes is not iterable` SSR crash

### Fixed

- Root `package.json` no longer duplicates `apps/web`'s entire runtime
  dependency list; `dev`/`build` now delegate to Turborepo instead of
  calling `vite` directly (previously only started `apps/web`, silently
  skipping `apps/admin`/`apps/api`)
- `apps/web/package.json` now declares the `@wealthspan/*` workspace packages
  it imports (previously only resolved via a Vite alias)
- Two instances of business logic misplaced in generic `lib/` folders
  moved into their owning feature (`apps/web`'s finance files,
  `apps/admin`'s registries)
- Removed a duplicate legacy copy of `apps/web` that existed at repo root,
  merging back 3 bug-fixed files it had that the current copy didn't

### Added

- Monorepo folder structure (`apps/`, `packages/`, `infrastructure/`)
- Full documentation set under `docs/` (platform + admin)
