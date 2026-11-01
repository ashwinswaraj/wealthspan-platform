# Documentation Index

This directory contains comprehensive documentation for the WEALTHSPAN platform.

## Getting Started

- **[Master Context](00_Master_Context.md)** — Project overview and key concepts (entry point)

## Development

- **[Architecture](Architecture/)** — Architectural patterns, standards, and decisions
  - [Coding Standards](Architecture/Coding_Standards.md) — Code quality, refactoring, and formatting rules
- **[ADR](ADR/)** — Architecture Decision Records (ADR-001 through ADR-010)

## Product & business context

- **[Business](Business/)** — Business model, pricing, target market, glossary
- **[Product](Product/)** — User roles, permissions matrix, state machines, system flows

## Per-app specifications

Each app has a numbered spec per module — check here before designing new
flows from scratch, rather than starting blank:

- **[Platform](Platform/)** — `apps/web` (client & professional web app) specs
- **[Admin](Admin/)** — `apps/admin` (super-admin panel) specs
- **[API](API/)** — `apps/api` contracts (routes, webhooks, events)

## Cross-cutting domains

- **[Database](Database/)** — Data model, entities, relationships, status enums
- **[Frontend](Frontend/)** — Design system, UI/UX guidelines, component library, tokens
- **[Security](Security/)** — Auth flow, authorization, encryption, RBAC, threat model, incident response
- **[DevOps](DevOps/)** — Deployment, environments, CI/CD, monitoring, logging, backups
- **[Testing](Testing/)** — Unit/integration/E2E strategy, QA and release checklists
- **[Integrations](Integrations/)** — Payment gateway, email, SMS, push, storage, maps, AI services
- **[Legal](Legal/)** — Privacy policy, terms, refund policy, client/professional agreements, DPA
- **[Roadmap](Roadmap/)** — MVP scope, phase 2/3 plans, future features
- **[Assets](Assets/)** — Logo, icons, colors, fonts, brand assets

## For AI agents

Don't treat the folders above as "scaffolded, fill in later" — they already
hold real, numbered specs. Read the relevant doc before implementing a
feature that touches that domain. See root [`AGENTS.md`](../AGENTS.md) for
repo-wide rules and [`ARCHITECTURE_RATIONALE.md`](../ARCHITECTURE_RATIONALE.md)
for why the repo is shaped the way it is.
