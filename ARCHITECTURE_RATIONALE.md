# Architecture Rationale — Har File/Folder Ka Reason

Rule: **Bina reason koi file/folder exist nahi karta.** Har entry ke saamne uska purpose tag hai:
`[SEC]` = Security | `[SCALE]` = Scalability | `[CLR]` = Clarity | `[RULE]` = Enforces a strict rule/convention | `[AUTO]` = Automation

---

## Root — sirf config, kabhi code nahi

| Path                                 | Reason                                                                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `turbo.json`                         | `[SCALE]` Build pipeline cache/parallelize karta hai — bina iske monorepo scale hi nahi karega                                    |
| `pnpm-workspace.yaml`                | `[RULE]` Define karta hai kaunse folders workspace packages hain — accidental nested installs rokta hai                           |
| `tsconfig.json` (root)               | `[CLR]` Base compiler config jise saare apps/packages extend karte hain — duplicate config rokta hai                              |
| `package.json` (root)                | `[SCALE]` Root scripts (`turbo run build`) + shared devDependencies — single source of truth                                      |
| `.env.example`                       | `[SEC]` Real secrets kabhi commit nahi hote; ye sirf naming template hai taaki team ko pata ho konse vars chahiye                 |
| `.gitignore`                         | `[SEC]` `.env`, `node_modules`, build output leak hone se rokta hai                                                               |
| `.editorconfig`                      | `[CLR]` Indentation/charset consistent rakhta hai cross-editor                                                                    |
| `.prettierrc` / `.prettierignore`    | `[CLR]` Code style ek jaisa — PR reviews me noise kam                                                                             |
| `eslint.config.js`                   | `[RULE]` Import boundaries (packages/ui → apps import na kare) yahin enforce hota hai                                             |
| `.nvmrc`                             | `[CLR]` Node version pin — "works on my machine" bugs rokta hai                                                                   |
| `pnpm-lock.yaml`                     | `[SCALE]` Lockfile = reproducible installs across machines/CI (pnpm-only, no other package manager)                               |
| `.vscode/settings.json`              | `[CLR]` Team-wide editor defaults (format-on-save) — consistency bina manual setup ke                                             |
| `.vscode/extensions.json`            | `[CLR]` Recommended extensions — naye dev ko sahi tools turant milte hain                                                         |
| `.husky/pre-commit`                  | `[SEC]`+`[RULE]`+`[AUTO]` Commit se pehle lint/type-check auto-run hota hai — broken/insecure code repo me jaane se rokta hai     |
| `.husky/commit-msg`                  | `[RULE]`+`[AUTO]` Commit message format auto-enforce karta hai (e.g. conventional commits) — changelog automation ke liye zaroori |
| `.github/workflows/*`                | `[SEC]`+`[SCALE]`+`[AUTO]` CI: lint, test, security-scan, deploy — sab automated pipeline se chalte hain, manual step nahi        |
| `.github/CODEOWNERS`                 | `[SEC]` Sensitive folders (infrastructure, auth) sirf specific log approve kar sakte hain                                         |
| `.github/dependabot.yml`             | `[SEC]`+`[AUTO]` Vulnerable dependencies ka automated alert/patch — bina manual scan ke                                           |
| `.github/ISSUE_TEMPLATE/*`           | `[CLR]` Bug reports structured aate hain — triage fast                                                                            |
| `.github/PULL_REQUEST_TEMPLATE.md`   | `[CLR]` Reviewer ko context milta hai bina puchhe                                                                                 |
| `AGENTS.md` (root + per-app/package) | `[RULE]` AI coding agents (Claude/Copilot) ke liye scoped rules — galat folder me code generate hone se rokta hai                 |
| `README.md`                          | `[CLR]` Onboarding — naya dev bina puche samajh sake                                                                              |
| `LICENSE`                            | `[SEC]` Legal usage rights clear — bina isse code "all rights reserved" default hota hai                                          |
| `SECURITY.md`                        | `[SEC]` Vulnerability disclosure process — researchers ko pata ho kaise report karein                                             |
| `CODE_OF_CONDUCT.md`                 | `[CLR]` Community/contributor behavior standard                                                                                   |
| `CONTRIBUTING.md`                    | `[CLR]` PR process, branch naming, commit rules — bina isse har PR alag tarike se aata                                            |
| `CHANGELOG.md`                       | `[CLR]` Version history — breaking changes track karne ke liye                                                                    |
| `UX_INTEGRITY_AUDIT.md`              | `[SCALE]` UX consistency audit trail — design drift rokta hai                                                                     |
| `.lovable/plan.md`, `project.json`   | `[CLR]` AI-builder tool ka project state — regenerate/sync ke liye zaroori                                                        |
| `tools/README.md`                    | `[CLR]` Custom dev-scripts ka documentation, taaki koi bina samjhe delete na kare                                                 |
| `tools/collect-dist.mjs`             | `[AUTO]`+`[SCALE]` Build ke baad har app ka `dist/` output ek jagah collect karta hai — manual copy-paste rokta hai               |

---

## apps/ — sirf deployable units

| Path                                           | Reason                                                                                                                                                                                                                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/`                                    | `[SCALE]` Public-facing app — independently deployable, isolated build                                                                                                                                                                                                |
| `apps/admin/`                                  | `[SEC]`+`[SCALE]` Alag app isliye ki admin permissions/access galti se public app me leak na ho                                                                                                                                                                       |
| `apps/api/`                                    | `[SCALE]` Backend alag deploy cycle — frontend redeploy kiye bina API update ho sakta hai                                                                                                                                                                             |
| `apps/*/public/`                               | `[CLR]` Static assets (favicon, robots.txt) — build tool directly serve karta hai                                                                                                                                                                                     |
| `apps/*/src/config/`                           | `[SEC]` Env vars/API client yahin centralize — hardcoded secrets kahin aur na phailein                                                                                                                                                                                |
| `apps/*/src/features/*/index.ts`               | `[RULE]` Barrel file = feature ka public API — bahar se internal files import nahi ho sakti                                                                                                                                                                           |
| `apps/*/src/features/example-feature/`         | `[CLR]` **Ye ek placeholder hai** — sirf pattern dikhane ke liye. Real project me isko `auth/`, `orders/`, `billing/` jaise actual feature names se replace karo. Har naye feature ke liye isi structure (`components/`, `hooks/`, `types/`, `index.ts`) ko copy karo |
| `apps/*/src/features/*/components,hooks,types` | `[CLR]` Feature ka sab kuch ek jagah — 10 alag folders me dhoondhna nahi padta                                                                                                                                                                                        |
| `apps/*/src/layouts/`                          | `[CLR]` Page shell (Header+Sidebar+Footer) reusable — har page me duplicate nahi                                                                                                                                                                                      |
| `apps/*/src/pages/`                            | `[CLR]` Thin route views — sirf features ko compose karte hain, logic nahi rakhte                                                                                                                                                                                     |
| `apps/*/src/routes/`                           | `[RULE]` Routing config alag — URL structure ek hi jagah control hota hai                                                                                                                                                                                             |
| `apps/*/src/services/`                         | `[SEC]` API calls yahin wrap hoti hain — auth tokens/headers ek jagah manage                                                                                                                                                                                          |
| `apps/*/src/lib/`                              | `[CLR]` Third-party glue code (router adapters) — vendor lock-in isolate karta hai                                                                                                                                                                                    |
| `apps/*/src/hooks/`, `utils/`                  | `[SCALE]` Reusable logic — duplication rokta hai as app grows                                                                                                                                                                                                         |
| `apps/*/src/store/`                            | `[SCALE]` Global state — sirf tab zaroori jab features ke beech shared state ho                                                                                                                                                                                       |
| `apps/api/src/middleware/`                     | `[SEC]` Auth/rate-limit checks centralize — har route me manually likhna na pade                                                                                                                                                                                      |
| `apps/api/tests/`                              | `[SEC]`+`[SCALE]` Regression catch karta hai before deploy                                                                                                                                                                                                            |
| `apps/*/.env.example`                          | `[SEC]` Per-app secrets ka naming reference (real values kabhi commit nahi)                                                                                                                                                                                           |
| `apps/*/vite.config.ts`, `tsconfig.json`       | `[CLR]` Har app ka apna build/type config, root config ko extend karta hai                                                                                                                                                                                            |

---

## packages/ — sirf shareable code

| Path                                      | Reason                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `packages/ui/`                            | `[SCALE]`+`[CLR]` Design system ek jagah — 2 apps me alag button styles na bane    |
| `packages/auth/`                          | `[SEC]` Auth logic ek jagah — security bug fix karo to sab apps me apply ho        |
| `packages/database/`                      | `[SEC]` DB client/queries centralize — connection strings/queries scattered na hon |
| `packages/types/`                         | `[SCALE]` Shared TS types — frontend/backend contract mismatch rokta hai           |
| `packages/hooks/`, `constants/`, `utils/` | `[SCALE]` Common logic ek jagah — code duplication rokta hai                       |
| `packages/validation/`                    | `[SEC]` Input validation schema shared — client aur server same rules use karein   |
| `packages/config/`                        | `[CLR]` Shared tsconfig/testing config — har package alag setup na likhe           |
| `packages/sdk/`                           | `[SCALE]` Public npm package — external consumers ke liye stable API surface       |
| `packages/*/package.json`                 | `[RULE]` Har package apna dependency tree declare kare — hidden coupling na ho     |

---

## infrastructure/ — sirf ops/security concerns

| Path                                           | Reason                                                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `infrastructure/database/config.toml`          | `[SEC]` DB config version-controlled but secrets alag (env se aate hain)                        |
| `infrastructure/secrets/secrets-management.md` | `[SEC]` Documents _how_ secrets rotate/store hote hain — actual secrets nahi                    |
| `infrastructure/proxy/nginx.conf`              | `[SEC]` Reverse proxy rules (rate limiting, headers) — direct app exposure rokta hai            |
| `infrastructure/seed/seed-admin.ts`            | `[CLR]`+`[AUTO]` Local/dev environment setup script auto-populates admin data — onboarding fast |
| `infrastructure/audit/README.md`               | `[SEC]` Audit logging strategy documented                                                       |

---

## docs/ — sirf documentation, koi code nahi

`[CLR]` Har subfolder (Architecture, Security, Legal, Admin, Platform, API, DevOps) ek domain document karta hai taaki decisions code me hardcoded na ho balki likhe hue milein — naya dev ya AI agent bina reverse-engineer kiye samajh sake.

---

## tests/

`[SEC]`+`[SCALE]` Root-level E2E/integration tests cross-app flows check karte hain (jo ek single app ke unit tests nahi pakad sakte) — unit tests khud feature folders ke andar rehte hain.

---

## Strict Enforcement Rule

Agar koi naya file/folder add karna ho aur uska reason in 5 categories (`SEC`, `SCALE`, `CLR`, `RULE`, `AUTO`) me se ek bhi na ho — **wo file yahan nahi honi chahiye.** Isi discipline se structure "perfect" rehta hai, bikhrta nahi.
