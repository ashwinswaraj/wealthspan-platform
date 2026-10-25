# AI Development Guidelines

> Status: Active · Owner: TBD · Last updated: 2026-08-31

## Purpose

This file used to be a placeholder. Root [`AGENTS.md`](../../AGENTS.md) is
the actual authoritative source for AI-agent rules in this repo — this
page just points there and highlights the parts most relevant to *product*
development (as opposed to the repo-structure rules `AGENTS.md` leads
with).

## What to read first

Before generating code in this repo, an AI agent should read, in order:
1. Root [`AGENTS.md`](../../AGENTS.md) — stack, folder rules, dependency
   direction, things to never do unconfirmed
2. The specific app/package's own `AGENTS.md`, if one exists (it overrides
   the root file for that app/package)
3. [`ARCHITECTURE_RATIONALE.md`](../../ARCHITECTURE_RATIONALE.md) — why
   each top-level folder exists
4. The relevant `docs/<Domain>/` spec for the feature being touched

## Things worth repeating here

- **Don't fabricate product/business/legal specifics.** Several docs in
  this repo (`docs/Legal/*`, `docs/Business/*`, parts of `docs/Security/*`)
  are intentionally left as drafts because they require a real decision —
  a lawyer, a product owner, a security review — not because no one got
  around to it. Filling them with invented specifics is worse than leaving
  them as `TODO`.
- **Ground technical docs in the actual code**, not assumption. Several
  docs in this repo were previously stale (describing folders or package
  names that no longer existed) — when writing documentation, verify
  against the current file tree and configs rather than trusting an
  existing doc's claim.

## References

- Root [`AGENTS.md`](../../AGENTS.md)
- [`ARCHITECTURE_RATIONALE.md`](../../ARCHITECTURE_RATIONALE.md)
