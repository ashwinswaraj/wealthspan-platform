# Documentation Index

Documentation for **Wealthspan**, an AI personal-accountant app ("The full arc of your money").

## Getting started

- **[Master Context](00_Master_Context.md)** — what Wealthspan is, architecture, shipped vs planned (entry point)
- **[Vision & Mission](01_Vision_Mission.md)** · **[Brand Guidelines](02_Brand_Guidelines.md)**

## Development

- **[Architecture](Architecture/)** — patterns, standards, decisions
- **[ADR](ADR/)** — Architecture Decision Records

## Product & business

- **[Business](Business/)** — model, plans, target market, glossary
- **[Product](Product/)** — roles, permissions, state machines, flows, notifications

## Per-app specifications

- **[Platform](Platform/)** — `apps/web` (user app) specs
- **[Admin](Admin/)** — `apps/admin` (admin panel) specs
- **[API](API/)** — `apps/api` Catalyst functions (finance, chat, files)

## Cross-cutting domains

- **[Database](Database/)** — data model and Catalyst Data Store schema
- **[Frontend](Frontend/)** — design system, tokens, conversion plan
- **[Security](Security/)** — auth, authorization, encryption, threat model
- **[DevOps](DevOps/)** — deployment, environments, CI/CD, monitoring
- **[Testing](Testing/)** — test strategy and checklists
- **[Integrations](Integrations/)** — payments, email, AI (Sarvam), storage; SMS/push/maps are not in Phase 1
- **[Legal](Legal/)** — privacy, terms, refunds, user agreement
- **[Roadmap](Roadmap/)** — MVP, Phase 2 / 3, future ideas
- **[Assets](Assets/)** — logo, icons, colors, fonts, brand assets

## For AI agents

These folders hold real specs; read the relevant doc before implementing. Where a doc says Planned or TBD, the code does not exist yet. See root [`AGENTS.md`](../AGENTS.md) for repo-wide rules.
