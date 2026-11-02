# Architecture Documentation

Architectural patterns, standards, and decisions for the Wealthspan monorepo.

| File | Contents |
| --- | --- |
| [`09_System_Architecture.md`](09_System_Architecture.md) | High-level system diagram and component overview |
| [`Coding_Standards.md`](Coding_Standards.md) | File-size thresholds, formatting rules, refactoring method |
| [`AI_Development_Guidelines.md`](AI_Development_Guidelines.md) | What an AI agent should read before generating code, and what not to fabricate |
| [`Dependency_Rules.md`](Dependency_Rules.md) | Which folders may import from which — apps/packages boundaries |
| [`Import_Rules.md`](Import_Rules.md) | Barrel-only imports, the `lazy()` exception, `lib/` vs feature-local logic |
| [`Folder_Ownership.md`](Folder_Ownership.md) | Why each top-level folder exists and its review path |
| [`Naming_Conventions.md`](Naming_Conventions.md) | File, component, and package naming rules |
| [`Repository_Rules.md`](Repository_Rules.md) | Hard constraints: pnpm-only, generated files, no secrets, never-do-unconfirmed list |
| [`Git_Workflow.md`](Git_Workflow.md) | What's mechanically enforced (`.husky/`) vs. policy-only |
| [`Decision_Log.md`](Decision_Log.md) | Running log of structural decisions; see [`ADR/`](../ADR/) for the fuller-format ones |

Current as of 2026-11-01. If any file looks stale against the repo, verify against the code before trusting it.
