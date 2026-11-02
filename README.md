# WEALTHSPAN

Wealthspan: an AI personal accountant ("the full arc of your money"). Monorepo containing the user web app, the admin panel, the Zoho Catalyst API functions, shared packages, and full product documentation.

Built and maintained with [Lovable](https://lovable.dev/projects/1b3730be-b1ba-45be-9a42-47616d773861).

> **For AI coding agents**: read [`AGENTS.md`](AGENTS.md) first — it's the
> authoritative source for stack, folder rules, and things to never do
> without confirmation.

## Repository structure

```
WEALTHSPAN/
├── .github/             workflows, issue/PR templates, CODEOWNERS, dependabot
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── .husky/              git hooks (pre-commit, commit-msg)
├── .lovable/            Lovable AI-builder project state
│   └── plan/                archived implementation plans
├── .vscode/             editor settings & recommended extensions
├── apps/                deployable apps — web, admin, api
│   ├── admin/               @wealthspan/admin — super-admin panel
│   │   ├── public/
│   │   ├── scripts/
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
│   ├── api/                 @wealthspan/api — backend edge service
│   │   ├── catalyst/
│   │   │   └── functions/
│   │   │       ├── chat/
│   │   │       │   └── src/
│   │   │       ├── files/
│   │   │       │   └── src/
│   │   │       └── finance/
│   │   │           └── src/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── features/
│   │   │   │   ├── admin/
│   │   │   │   ├── auth/
│   │   │   │   ├── catalog/
│   │   │   │   ├── chat/
│   │   │   │   ├── files/
│   │   │   │   ├── finance/
│   │   │   │   └── subscription/
│   │   │   ├── middleware/
│   │   │   └── utils/
│   │   └── tests/
│   │       ├── features/
│   │       │   ├── admin/
│   │       │   ├── auth/
│   │       │   ├── catalog/
│   │       │   ├── chat/
│   │       │   ├── files/
│   │       │   ├── finance/
│   │       │   └── subscription/
│   │       └── middleware/
│   └── web/                 @wealthspan/web — Wealthspan user app
│       ├── public/
│       ├── scripts/
│       └── src/
│           ├── components/
│           ├── config/
│           ├── features/
│           │   ├── projects/
│           │   │   ├── components/
│           │   │   ├── hooks/
│           │   │   └── lib/
│           │   ├── sheets/
│           │   │   ├── components/
│           │   │   └── hooks/
│           │   ├── wealthspan-auth/
│           │   │   ├── components/
│           │   │   ├── hooks/
│           │   │   └── lib/
│           │   └── wealthspan-shell/
│           │       ├── components/
│           │       ├── hooks/
│           │       └── lib/
│           ├── hooks/
│           ├── layouts/
│           ├── pages/
│           ├── routes/
│           ├── services/
│           ├── store/
│           └── utils/
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
├── infrastructure/      ops & security — DB config, proxy, secrets docs, seed scripts
│   ├── audit/
│   ├── database/
│   ├── proxy/
│   ├── secrets/
│   └── seed/
├── packages/            shared internal libraries (workspace:* only)
│   ├── auth/
│   │   └── src/
│   │       └── hooks/
│   ├── config/
│   │   ├── src/
│   │   └── testing/
│   ├── constants/
│   │   └── src/
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
│   │       └── __tests__/
│   └── validation/
│       └── src/
│           └── __tests__/
├── tests/               root-level cross-app E2E/integration tests
└── tools/
```

**Key notes:**

- Each app under `apps/` is a standalone Vite/React project with its own `package.json`. `build`, `typecheck`, and `test` run from the repo root via Turborepo, fanning out to every app in parallel. `dev` is scoped to `apps/web` only (see below) — `web` and `admin` currently default to the same dev port, so running both via one root command isn't safe yet.
- Every `apps/*/src/` follows the same shape: `features/<domain>/` for business logic (each with an `index.ts` barrel — see [`AGENTS.md`](AGENTS.md) §3), plus top-level `components/`, `pages/`, `routes/`, `layouts/`, `hooks/`, `utils/`, `lib/`, `services/`, `config/`, `store/` for cross-feature or infrastructural code.
- Shared packages are managed as workspace dependencies (referenced via `"@wealthspan/x": "workspace:*"`, never a version number).
- `packages/ui/src/design-system/` is the single source of UI truth — feature code imports from `@wealthspan/ui/design-system`, never by reaching into another package's internals.

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
`apps/web` only (`turbo run dev --filter=@wealthspan/web`). To run `admin`'s
dev server, use pnpm's `--filter` directly, which runs that app's own
`package.json` script on its own terminal/port:

```sh
pnpm --filter @wealthspan/web dev         # Web app dev server (same as root `pnpm dev`)
pnpm --filter @wealthspan/admin dev       # Admin panel dev server
pnpm --filter @wealthspan/api typecheck   # API service (no dev server yet — see apps/api/AGENTS.md)
```

Giving `web` and `admin` distinct dev ports (so both could run together
under one root `turbo run dev`) is tracked in `.lovable/plan.md`.

### Build Modes

Production build is turbo-orchestrated from root; development-mode builds
and local preview are per-app (they only make sense for one app at a time):

```sh
pnpm build                                    # Production build, all apps
pnpm --filter @wealthspan/web build:dev           # Web: development-mode build with debug info
pnpm --filter @wealthspan/web preview             # Web: preview a production build locally
pnpm --filter @wealthspan/admin build:dev         # Admin: same, for the admin app
pnpm --filter @wealthspan/admin preview
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
