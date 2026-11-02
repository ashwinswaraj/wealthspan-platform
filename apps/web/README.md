# @wealthspan/web

Wealthspan user web app (projects, Excel-style sheets, AI accountant chat) (TanStack Start + React 19 + Tailwind v4).

## Layout

```
src/
  features/         business domains — projects, sheets,
                    wealthspan-auth, wealthspan-shell. Each
                    has an index.ts barrel; import from there, not deep paths.
  routes/           file-based TanStack routes (auto-generates routeTree.gen.ts
                    — never hand-edit that file, see root AGENTS.md §4)
  pages/            thin page components rendered by routes; compose
                    features, no business logic of their own
  components/       cross-feature shared UI only (e.g. ConnectionPill.tsx) — not a dumping ground
                    for new feature code
  layouts/  hooks/  lib/  services/  utils/  config/  store/
public/             static assets
tests/              test suite
```

UI comes from `@wealthspan/ui/design-system` only — this app has no local
design-system folder of its own.

## Commands

Run from this app's folder, or from the repo root with `pnpm --filter @wealthspan/web <script>`:

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
- Import UI only from `@wealthspan/ui/design-system`, never `@wealthspan/ui/components/*`.
- Import from a feature's barrel (`@/features/sheets`), not its internals
  — except `lazy()`-wrapped imports, which stay deep on purpose.
- Money is typed in rupees and stored as paise; never do money math in a component (use `@wealthspan/utils`).
