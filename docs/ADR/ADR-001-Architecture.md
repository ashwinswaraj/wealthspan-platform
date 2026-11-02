# ADR-001: Monorepo with apps/* and feature-driven src/

> Status: Accepted · Last updated: 2026-11-01

## Context

Wealthspan has three deployables (user app, admin panel, API functions) that share money rules, types and validation. Those rules must be identical on the client and the server.

## Decision

One pnpm + Turborepo monorepo: `apps/{web,admin,api}` plus `packages/*` (shared types, validation, constants, utils, UI). Each app's `src/` is organised as `features/<domain>/` with a barrel `index.ts`. Root scripts delegate to `turbo run <task>`; `pnpm check:structure` enforces the folder tree in the README.

## Consequences

- Money maths (`packages/utils/src/finance.ts`), sheet definitions (`packages/constants/src/sheets.ts`) and input rules (`packages/validation/src/finance.ts`) have one definition used by web, API and chatbot.
- Backend choice is separate: see ADR-002 (Zoho Catalyst functions).
- Trade-off: admin and web are separate Vite apps and must never import each other.

## References

- Root `AGENTS.md`, [Dependency_Rules](../Architecture/Dependency_Rules.md)
