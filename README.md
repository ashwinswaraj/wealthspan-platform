# JOBRIO

Workforce-as-a-Service platform. Monorepo containing the client/professional web app, the super-admin panel, the API service, shared packages, and full product documentation.

Built and maintained with [Lovable](https://lovable.dev/projects/1b3730be-b1ba-45be-9a42-47616d773861).

> **For AI coding agents**: read [`AGENTS.md`](AGENTS.md) first — it's the
> authoritative source for stack, folder rules, and things to never do
> without confirmation.

## Repository structure

```
JOBRIO/
├── .github/             workflows, issue/PR templates, CODEOWNERS, dependabot
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── .husky/              git hooks (pre-commit, commit-msg)
├── .lovable/            Lovable AI-builder project state
│   └── plan/                archived implementation plans
├── .vscode/             editor settings & recommended extensions
├── apps/                deployable apps — web, admin, api
│   ├── admin/               @jobrio/admin — super-admin panel
│   │   ├── public/
│   │   └── src/
│   │       ├── components/
│   │       ├── config/
│   │       ├── features/
│   │       │   └── admin-dashboard/
│   │       │       ├── components/
│   │       │       │   └── sections/
│   │       │       └── lib/
│   │       ├── hooks/
│   │       ├── layouts/
│   │       ├── lib/
│   │       ├── pages/
│   │       │   ├── auth/
│   │       │   └── dashboard/
│   │       │       └── admin/
│   │       ├── routes/
│   │       │   └── dashboard/
│   │       ├── services/
│   │       └── utils/
│   ├── api/                 @jobrio/api — backend edge service
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── features/
│   │   │   │   └── auth/
│   │   │   ├── middleware/
│   │   │   └── utils/
│   │   └── tests/
│   │       └── features/
│   │           └── auth/
│   └── web/                 @jobrio/web — client & professional web app
│       ├── public/
│       └── src/
│           ├── assets/
│           │   └── icons/
│           ├── components/
│           │   └── dashboard/
│           ├── config/
│           ├── features/
│           │   ├── auth/
│           │   │   └── components/
│           │   ├── dashboard-client/
│           │   │   ├── components/
│           │   │   │   └── sections/
│           │   │   │       └── settings/

│           │   │   └── lib/
│           │   ├── dashboard-professional/
│           │   │   └── components/
│           │   ├── legal/
│           │   │   └── components/
│           │   ├── marketing/
│           │   │   └── components/
│           │   └── signup/
│           │       └── components/
│           ├── hooks/
│           ├── layouts/
│           ├── lib/
│           ├── pages/
│           │   ├── auth/
│           │   ├── dashboard/
│           │   │   ├── client/
│           │   │   └── professional/
│           │   └── signup/
│           │       ├── client/
│           │       └── professional/
│           ├── routes/
│           │   ├── dashboard/
│           │   └── signup/
│           │       ├── client/
│           │       └── professional/
│           ├── services/
│           ├── store/
│           └── utils/
├── packages/            shared internal libraries (workspace:* only)
│   ├── auth/
│   │   └── src/
│   │       ├── components/
│   │       └── hooks/
│   ├── config/
│   │   ├── src/
│   │   └── testing/
│   ├── constants/
│   │   └── src/
│   │       ├── __tests__/
│   │       └── actions/
│   │           └── __tests__/
│   ├── database/
│   │   └── src/
│   ├── hooks/
│   │   └── src/
│   ├── sdk/
│   │   └── src/
│   ├── types/
│   │   └── src/
│   ├── ui/
│   │   └── src/
│   │       ├── components/
│   │       ├── design-system/
│   │       │   ├── feedback/
│   │       │   ├── icons/
│   │       │   ├── layout/
│   │       │   ├── motion/
│   │       │   ├── primitives/
│   │       │   └── tokens/
│   │       └── shared/
│   ├── utils/
│   │   └── src/
│   └── validation/
│       └── src/
│           └── __tests__/
├── infrastructure/      ops & security — DB config, proxy, secrets docs, seed scripts
│   ├── audit/
│   ├── database/
│   ├── proxy/
│   ├── secrets/
│   └── seed/
├── docs/                product & architecture documentation, by domain
│   ├── ADR/
│   ├── API/
│   ├── Admin/
│   ├── Architecture/
│   ├── Assets/
│   ├── Business/
│   ├── Database/
│   ├── DevOps/
│   ├── Frontend/
│   ├── Integrations/
│   ├── Legal/
│   ├── Platform/
│   ├── Product/
│   ├── Roadmap/
│   ├── Security/
│   └── Testing/
├── tests/               root-level cross-app E2E/integration tests
├── tools/
└── (root-level files: .editorconfig, .env, .env.example, .gitignore, .nvmrc, .prettierignore, .prettierrc, AGENTS.md, ARCHITECTURE_RATIONALE.md, CHANGELOG.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md, LICENSE, README.md, SECURITY.md, UX_INTEGRITY_AUDIT.md, eslint.config.js, package.json, pnpm-lock.yaml, pnpm-workspace.yaml, tsconfig.json, turbo.json, vercel.json, vite.config.ts)
```

**Key notes:**
- Each app under `apps/` is a standalone Vite/React project with its own `package.json`. `build`, `typecheck`, and `test` run from the repo root via Turborepo, fanning out to every app in parallel. `dev` is scoped to `apps/web` only (see below) — `web` and `admin` currently default to the same dev port, so running both via one root command isn't safe yet.
- Every `apps/*/src/` follows the same shape: `features/<domain>/` for business logic (each with an `index.ts` barrel — see [`AGENTS.md`](AGENTS.md) §3), plus top-level `components/`, `pages/`, `routes/`, `layouts/`, `hooks/`, `utils/`, `lib/`, `services/`, `config/`, `store/` for cross-feature or infrastructural code.
- Shared packages are managed as workspace dependencies (referenced via `"@jobrio/x": "workspace:*"`, never a version number).
- `packages/ui/src/design-system/` is the single source of UI truth — feature code imports from `@jobrio/ui/design-system`, never by reaching into another package's internals.

## Development

### Prerequisites
- Node.js 22+
- pnpm 9.0.0+

### Setup & Common Commands

```sh
pnpm install                    # Install all dependencies

pnpm dev                        # Run apps/web's dev server via turbo (see note below)
pnpm build                      # Build all apps and packages via turbo
pnpm lint                       # Run linter on all files
pnpm format                     # Format all files with prettier
pnpm typecheck                  # Type check all workspaces via turbo
pnpm test                       # Run tests across all workspaces via turbo
```

### Working on Individual Apps

`build`, `typecheck`, and `test` run every app at once through Turborepo.
`dev` is different: `web` and `admin` currently default to the same dev
port (`8080`, from `@lovable.dev/vite-tanstack-config`), so running both at
once from one root command isn't safe yet — `pnpm dev` is scoped to
`apps/web` only (`turbo run dev --filter=@jobrio/web`). To run `admin`'s
dev server, use pnpm's `--filter` directly, which runs that app's own
`package.json` script on its own terminal/port:

```sh
pnpm --filter @jobrio/web dev         # Web app dev server (same as root `pnpm dev`)
pnpm --filter @jobrio/admin dev       # Admin panel dev server
pnpm --filter @jobrio/api typecheck   # API service (no dev server yet — see apps/api/AGENTS.md)
```

Giving `web` and `admin` distinct dev ports (so both could run together
under one root `turbo run dev`) is tracked in `.lovable/plan.md`.

### Build Modes

Production build is turbo-orchestrated from root; development-mode builds
and local preview are per-app (they only make sense for one app at a time):

```sh
pnpm build                                    # Production build, all apps
pnpm --filter @jobrio/web build:dev           # Web: development-mode build with debug info
pnpm --filter @jobrio/web preview             # Web: preview a production build locally
pnpm --filter @jobrio/admin build:dev         # Admin: same, for the admin app
pnpm --filter @jobrio/admin preview
```

## Documentation

Start at [`docs/00_Master_Context.md`](docs/00_Master_Context.md) for the project overview.

**Development guides:**
- AI agent rules: [`AGENTS.md`](AGENTS.md) — stack, folder rules, and what an AI must never do unconfirmed
- Why each file/folder exists: [`ARCHITECTURE_RATIONALE.md`](ARCHITECTURE_RATIONALE.md)
- Coding standards: [`docs/Architecture/Coding_Standards.md`](docs/Architecture/Coding_Standards.md) — rules for refactoring, naming, and code quality
- Architecture decisions & patterns: [`docs/Architecture/`](docs/Architecture/)
- Full documentation index: [`docs/README.md`](docs/README.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), [docs/Architecture/Coding_Standards.md](docs/Architecture/Coding_Standards.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md).
