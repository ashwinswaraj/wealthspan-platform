# @jobrio/web

Client & professional web application (TanStack Start + React 19 + Tailwind v4).

## Layout

```
src/
  features/         business domains — marketing, auth, signup,
                    dashboard-client, dashboard-professional, legal. Each
                    has an index.ts barrel; import from there, not deep paths.
  routes/           file-based TanStack routes (auto-generates routeTree.gen.ts
                    — never hand-edit that file, see root AGENTS.md §4)
  pages/            thin page components rendered by routes; compose
                    features, no business logic of their own
  components/       cross-feature shared UI only (e.g. dashboard/shared.tsx,
                    used by both dashboard features) — not a dumping ground
                    for new feature code
  layouts/  hooks/  lib/  services/  utils/  config/  store/
public/             static assets
tests/              test suite
```

UI comes from `@jobrio/ui/design-system` only — this app has no local
design-system folder of its own.

## Commands

Run from this app's folder, or from the repo root with `pnpm --filter @jobrio/web <script>`:

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm build:dev    # development-mode build with debug info
pnpm preview      # preview a production build locally
pnpm lint
```

## Rules

See `AGENTS.md` (this folder's own, falling back to the root one) for the
full list. In short:
- Import UI only from `@jobrio/ui/design-system`, never `@jobrio/ui/components/*`.
- Import from a feature's barrel (`@/features/marketing`), not its internals
  — except `lazy()`-wrapped imports, which stay deep on purpose.
- `client` and `professional` dashboard logic are separate features; don't merge them.
