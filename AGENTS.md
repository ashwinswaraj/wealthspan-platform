<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AGENTS.md — Rules for AI-assisted development

Read this file **before** touching any file in the repo. It applies
everywhere except where a more specific `AGENTS.md` overrides it (each app
and sensitive package has its own — see [§10](#10-more-specific-rules-that-override-this-file)).
If something here conflicts with what you observe in the code, **this file
wins** — the code may be mid-migration or simply wrong; fix the code to
match this file, not the other way around, unless the discrepancy is listed
in [§9](#9-known-deviations--do-not-silently-fix-these) as intentional.

---

## 1. Repo shape (source of truth — ignore stale docs that disagree)

```
apps/
  web/      @jobrio/web    — public client + professional web app (Vite + TanStack Start)
  admin/    @jobrio/admin  — super-admin panel (Vite + TanStack Start)
  api/      @jobrio/api    — backend edge service (currently a thin scaffold — see apps/api/AGENTS.md)
packages/
  ui/           @jobrio/ui           — design system + shared components (single source of UI truth)
  auth/         @jobrio/auth         — auth logic, shared across apps
  database/     @jobrio/database     — DB client/types
  types/        @jobrio/types        — shared TS types (frontend/backend contract)
  hooks/        @jobrio/hooks        — shared React hooks
  constants/    @jobrio/constants    — cross-app constants + the reactive order/service registries
  utils/        @jobrio/utils        — shared utility functions
  validation/   @jobrio/validation   — shared zod schemas (client + server use the same rules)
  config/       @jobrio/config       — shared tsconfig/testing config
  sdk/          @jobrio/sdk          — public npm package for external consumers
infrastructure/  — ops/security only (db config, proxy, secrets docs, seed scripts) — no app code
docs/            — product & architecture docs, organized by domain
tests/           — root-level cross-app E2E/integration tests only (unit tests live inside each feature)
```

**Known stale doc**: `README.md`'s tree diagram and its `pnpm --filter` example
still call the web app `apps/platform` / `@jobrio/platform`. That name no
longer exists — the real app is `apps/web`, package `@jobrio/web` (confirmed
in `apps/web/package.json`). Don't "helpfully" rename `apps/web` back to
`platform` to match the README — the README is what's outdated. Feel free to
fix the README itself if you're touching it anyway.

---

## 2. Stack (fixed — don't suggest or introduce alternatives)

- Frontend: React 19 + TanStack Start/Router + Vite + Tailwind v4
- Backend: no framework chosen yet — `apps/api` is intentionally a minimal
  scaffold (Supabase Auth does identity; the app is a thin edge layer). Don't
  add Express/Hono/Fastify/etc. without being asked.
- Database: Supabase (Postgres)
- Package manager: **pnpm only**. Never generate or commit a `package-lock.json`,
  `yarn.lock`, or `bun.lock` — `pnpm-lock.yaml` is the single lockfile. Internal
  cross-package dependencies use `"@jobrio/x": "workspace:*"`, never a version
  number or a relative path.
- Build orchestration: Turborepo. Root `package.json`'s `build`, `typecheck`,
  and `test` scripts delegate to `turbo run <task>`, fanning out to every
  app per `turbo.json`'s pipeline. `dev` is intentionally scoped to
  `apps/web` only — `turbo run dev --filter=@jobrio/web --` — because `web`
  and `admin` currently default to the same dev port and running both
  under one unscoped `turbo run dev` collides (and `turbo` doesn't accept a
  `--port` override to route around it). Run `admin`'s dev server
  separately: `pnpm --filter @jobrio/admin dev`. **Never** widen the root
  `dev` script back to unscoped `turbo run dev` without first giving `web`
  and `admin` distinct ports. **Never** add a root script that calls
  `vite`/`tsc`/etc. directly — that only touches one app and silently skips
  the others (this exact bug existed once and was fixed; don't reintroduce it).

---

## 3. Feature-driven architecture (the core rule — read carefully)

Each app's `src/features/<domain>/` holds one self-contained business
domain: `components/`, `hooks/`, `types/`, `lib/` as needed, plus an
`index.ts` **barrel** that is the feature's public API.

- **Import from the barrel, not deep paths.** Other code should do
  `import { Thing } from "@/features/orders"`, never
  `import { Thing } from "@/features/orders/components/Thing"`.
- **Exception — code-split `lazy()` imports.** If a section is wrapped in
  `React.lazy(() => import(...))` for route-level code-splitting, keep the
  import path deep and specific to that one module. Routing it through the
  barrel would pull the entire feature into every lazy chunk and defeat the
  code-splitting. See `apps/admin/src/pages/dashboard/admin/Dashboard.tsx`
  for the reference pattern (deep lazy imports + a barrel that still exists
  for non-lazy consumers).
- **A feature's internals never import another feature's internals.**
  Cross-feature imports go through the other feature's barrel. Code that's
  genuinely shared by 2+ features (not business logic — just UI atoms or
  helpers) belongs in the app's top-level `src/components/`, `src/hooks/`,
  or `src/utils/`, not duplicated into each feature and not left in one
  feature for another to reach into. (Reference case:
  `apps/web/src/components/dashboard/shared.tsx` holds atoms used by both
  `dashboard-client` and `dashboard-professional`.)
- **`pages/` stays thin.** A page composes one or more features and renders
  them; it does not contain business logic, content dictionaries, or state
  machines. If you find yourself writing real logic in a `pages/*.tsx` file,
  that logic belongs in a feature (it was moved out once already — see
  `apps/web/src/features/legal/`, which used to be `pages/LegalPage.tsx`).
- **`lib/` is for third-party glue only** (router adapters, SDK wrappers) —
  never business logic. If a `lib/` file is only ever imported by one
  feature, it's misplaced; move it into that feature's `lib/`. (This exact
  mistake was found and fixed twice already: `apps/web/src/lib/order-*.ts` →
  `features/dashboard-client/lib/`, and `apps/admin/src/lib/{billRegistry,opsRegistry}.ts`
  → `features/admin-dashboard/lib/`. Don't create a third instance.)
- **When adding a new feature**, copy the shape of an existing one
  (`apps/web/src/features/marketing/` is a simple example;
  `apps/admin/src/features/admin-dashboard/` is a larger one) — real domain
  name, never `example-feature` or another placeholder name.

---

## 4. `routes/` is generated — treat it with care

`apps/{web,admin}/src/routes/` is TanStack Router's **file-based routing**:
the folder/file structure directly determines URL structure, and
`routeTree.gen.ts` is auto-generated from it by the router's codegen tool.

- **Never hand-edit `routeTree.gen.ts`.** Regenerate it with the router's
  build/dev tooling after any change under `routes/`.
- **Don't restructure `routes/` the way you would `features/` or
  `components/`.** Moving/renaming files here changes real URLs. If a route
  file's *implementation* is doing too much, move the logic into a feature
  and leave a thin route file behind — don't move the route file itself
  without a specific reason.
- `pages/` and `routes/` are deliberately separate: `routes/` = URL → thin
  wrapper, `pages/` = the thin wrapper's content (which composes features).

---

## 5. Design system — one source of truth

`packages/ui/src/design-system/` (imported as `@jobrio/ui/design-system`) is
the **only** source of design-system UI. Every app and feature must import
from `@jobrio/ui/design-system` — never reach into `@jobrio/ui/src/components/*`
directly from feature code, and never recreate a button/input/container
locally. If a required component doesn't exist yet, add it inside
`packages/ui/src/design-system/`, re-export it from
`packages/ui/src/design-system/index.ts` (or the relevant subfolder:
`primitives/`, `layout/`, `feedback/`, `motion/`, `icons/`, `tokens/`), then
consume it from there.

(Note: this used to live at a root-level `src/design-system/` before the
monorepo split — if you see any doc or comment referencing that old path,
it's stale; the package above is current.)

---

## 6. Dependency direction (convention only — not yet enforced by tooling)

- `packages/*` → never imports from any `apps/*`. Shared code must not
  depend on an app.
- `apps/web` and `apps/admin` → may import from any `packages/*`, never
  from each other.
- **Known existing exception, not to be copied**: `apps/web/src/routes/dashboard/super.tsx`
  and `super.sub.tsx` import `apps/admin`'s Dashboard page directly (a
  "super admin embedded in web" route, with a comment justifying it). This
  is a pre-existing violation of the rule above — don't treat it as
  precedent for new code, and don't silently "fix" it either (the correct
  fix is extracting a shared package, which is a product/architecture
  decision, not a refactor to make unprompted).

---

## 7. AI must NEVER do without explicit confirmation

- Modify or delete files in any `migrations/` folder (none exist yet in
  `packages/database/` or `infrastructure/database/` at the time of writing,
  but the rule applies the moment one is added — schema changes belong
  there and nowhere else).
- Touch any `.env` or `.env.*` file other than `.env.example`.
- Run destructive DB commands (`DROP`, `TRUNCATE`, `DELETE` without `WHERE`).
- Add a new top-level folder (root or inside `apps/*/src/`) without asking —
  every folder in this repo has a documented reason (see
  `ARCHITECTURE_RATIONALE.md`); a new one needs the same justification.
- Introduce a new library/framework not listed in [§2](#2-stack-fixed--dont-suggest-or-introduce-alternatives).
- Add a `package.json` dependency without also declaring it in the
  package/app that actually imports it (don't rely on a bundler alias to
  paper over a missing dependency — that exact bug existed in
  `apps/web/package.json` and was fixed).

---

## 8. Naming

- Files: kebab-case
- Components: PascalCase
- Functions/variables: camelCase
- DB tables: snake_case
- Feature folders: kebab-case, real domain name (`dashboard-client`, not
  `DashboardClient` or `example-feature`)

---

## 9. Known deviations — do not silently "fix" these

These were found during the migration into this structure and deliberately
left as-is or flagged rather than resolved unilaterally. Full reasoning in
`migration-report.md` if present in this repo's history.

1. **Root `vite.config.ts`** is a 4-line pointer
   (`export { default } from "./apps/web/vite.config"`), not a duplicate —
   Lovable's build/preview tooling and the root `turbo`-driven `dev`/`build`
   scripts expect a `vite.config.ts` at repo root. Don't delete it as
   "redundant."
2. **`apps/admin/src/features/admin-dashboard/`** is one large feature
   rather than split into per-domain features (finance, security, workforce,
   etc.), because its ~20 files share state and UI atoms with no
   independent public API per section. If you're asked to split it further,
   that's a product/ownership decision — confirm the boundaries with a human
   first, don't infer them from the code alone.
3. See [§6](#6-dependency-direction-convention-only--not-yet-enforced-by-tooling)
   for the `apps/web` → `apps/admin` cross-app import exception.

---

## 10. More specific rules that override this file

- `apps/{web,admin,api}/AGENTS.md` — app-specific rules
- `packages/auth/AGENTS.md`, `packages/database/AGENTS.md`,
  `infrastructure/database/AGENTS.md` — extra caution for sensitive code
- `docs/Architecture/Coding_Standards.md` — file-size/modularization
  thresholds and the full `adminSections.tsx` modularization case study
  referenced in [§3](#3-feature-driven-architecture-the-core-rule--read-carefully)
- `ARCHITECTURE_RATIONALE.md` (root) — the reason every top-level file/folder
  in this repo exists; consult before adding or removing anything at that level

---

## 11. Current priorities

- `apps/api` is still a scaffold beyond its one `auth` feature — no HTTP
  framework is wired up yet (`src/index.ts` is a stub). Don't build out new
  API routes without confirming the framework choice first.
- Several `docs/Architecture/*.md` files (`Dependency_Rules.md`,
  `Import_Rules.md`, `Folder_Ownership.md`, `Naming_Conventions.md`,
  `Repository_Rules.md`, `Decision_Log.md`, `Git_Workflow.md`,
  `AI_Development_Guidelines.md`) are single-line `# TODO` stubs. This
  `AGENTS.md` is the authoritative source for those topics until they're
  filled in — don't defer to them over what's written here.
- The [§6](#6-dependency-direction-convention-only--not-yet-enforced-by-tooling)
  cross-app violation and the [§9.2](#9-known-deviations--do-not-silently-fix-these)
  admin-dashboard feature-splitting question are both open decisions for the
  team, not for an AI agent to resolve.

---

## 12. Wealthspan direction (owner decisions, 2026-10-24)

This repo is being converted from Jobrio to Wealthspan. Where this section
conflicts with §2 (Stack), **this section wins**. Full reasoning in
`docs/Architecture/Decision_Log.md`.

- Backend functions: **Zoho Catalyst** (Node.js). Do not add Express/Hono/etc.
  inside `apps/api` without asking; Catalyst is the chosen server platform.
- AI provider: **Sarvam**, behind an adapter (don't call the provider
  directly from feature code).
- Database + login: **Zoho Catalyst too** (Data Store + Authentication) — the
  owner chose "everything on Catalyst"; Supabase is dropped for Wealthspan.
  Existing `@jobrio/database` / `@jobrio/auth` Supabase code stays until the
  owner approves replacing it; new finance code must not depend on Supabase.
  Catalyst constraints to design around: ZCQL has no documented row cap
  (always paginate with `LIMIT offset,count`), max 4 JOINs, Var Char ≤ 255,
  Text ≤ 10,000 chars, Int ≤ 10 digits (use BigInt for paise), Advanced I/O
  functions time out at 30 s, only Google/Zoho/Facebook/LinkedIn/Microsoft
  social login + third-party (custom token) auth are documented — email-code
  login is NOT confirmed. Server code always takes the user from the Catalyst
  session, never from a client-supplied id.
- Finance domain rules live in `packages/constants/src/finance.ts`,
  `packages/types/src/finance.ts`, `packages/validation/src/finance.ts` and
  `packages/utils/src/finance.ts`; the spec is
  `docs/Database/41_Wealthspan_Data_Model.md`. All money is integer paise.
  Never do money arithmetic in a component or in the chatbot prompt — call
  `@jobrio/utils`.
- Jobrio-specific code (orders, professionals, QA, escrow) is being removed:
  the owner approved the clean-up on 2026-10-30. The architecture (folders,
  feature-driven layout, `@jobrio/*` package scope) stays; Wealthspan code
  goes where the Jobrio code was. `apps/web` is already clean (route `/` is
  the Wealthspan home); `apps/admin` and the shared packages are next.
