# Design System

> Status: Draft · Last updated: 2026-11-01

## Purpose

Describe where the design system lives and how apps are meant to consume it.

## Details

The design system is `packages/ui/src/design-system/`, imported by every
app as `@wealthspan/ui/design-system` — **the single sanctioned UI import
surface** (see that folder's own `README.md`, and root `AGENTS.md` §5).
Neither `apps/web` nor `apps/admin` has (or should create) a local
design-system folder of its own.

Structure:

```
design-system/
  tokens/       colors, typography, spacing, radius, elevation, opacity,
                z-index, motion, breakpoints, icon sizing — see
                48_Design_Tokens.md
  primitives/   base building blocks (Button, Input, Avatar, Badge, ...)
  layout/       structural components (Card, Container, PageHeader, StatCard)
  feedback/     loading/empty/error states, skeletons
  motion/       shared transition definitions
  icons/        icon exports
```

Rule from the package's own header comment: don't add a new token value
without design-lead approval, and consumers must import from
`@wealthspan/ui/design-system` rather than hardcoding raw values.

## Open Questions

- [ ] Formal design-lead approval process isn't documented beyond the
      comment in `tokens/index.ts` — who approves, and how, isn't written down

## References

- `packages/ui/src/design-system/README.md`
- `47_Component_Library.md`, `48_Design_Tokens.md`
- Root `AGENTS.md` §5
