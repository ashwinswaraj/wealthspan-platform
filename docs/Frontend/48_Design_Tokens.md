# Design Tokens

> Status: Draft · Last updated: 2026-11-01

## Purpose

Document the actual token set in `packages/ui/src/design-system/tokens/index.ts`
— the single source of truth for design values (see that file's own header:
"Do NOT add a new value here unless the design lead has approved it").

## Scope

- Covers: the token categories that exist today
- Does not cover: raw HSL/hex values (those live in `apps/web/src/styles.css`
  as CSS custom properties; tokens reference them via `hsl(var(--x))`, they
  don't duplicate them)

## Details

| Category    | Export                    | Examples                                                                                                                                                                                              |
| ----------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color       | `colors`                  | Material-Design-3-style role naming: `primary`, `primaryContainer`, `onPrimary`, `secondary`, `tertiary`, a full surface stack (`surface`, `surfaceLow`...`surfaceHighest`), `outline`, `destructive` |
| Typography  | `typography`              | `family.headline`, `family.body` and `family.label` are all Inter; a `scale` from `display` down to `caption` (Tailwind utility strings, not raw sizes)                                               |
| Spacing     | `spacing`                 | `section`, `sectionCompact`, `page` — Tailwind's default spacing scale is the only sanctioned spacing beyond these                                                                                    |
| Radius      | `radius`                  | `xs` (2px) through `3xl` (24px), plus `pill`                                                                                                                                                          |
| Elevation   | `elevation`               | Standard shadows (`sm`/`md`/`lg`) plus named glow effects (for example `ctaBlue`, `ctaWhite`; some names are leftovers from the previous product)                                                     |
| Opacity     | `opacity`                 | `disabled`, `muted`, `ghost`                                                                                                                                                                          |
| Z-index     | `zIndex`                  | `base` through `tooltip` (0–70)                                                                                                                                                                       |
| Motion      | `motion`                  | Durations (`fast`/`base`/`slow`), easings, and named interaction patterns (`press`, `hover`, `hoverLift`, `fadeIn`, `scaleIn`)                                                                        |
| Breakpoints | `breakpoints`             | Standard Tailwind breakpoints (`sm` 640 – `2xl` 1536)                                                                                                                                                 |
| Icon sizing | `iconSizes`, `iconStroke` | `xs` (14) – `xl` (28), stroke width 1.5                                                                                                                                                               |

Every color token resolves via a CSS custom property (`hsl(var(--primary))`,
etc.) defined in `apps/web/src/styles.css` — that file is where the actual
HSL numbers live, not this package.

## References

- `packages/ui/src/design-system/tokens/index.ts`
- `apps/web/src/styles.css`
- `docs/Assets/77_Colors.md`, `docs/Assets/78_Fonts.md`

Note: Inter is the one UI font in both apps. The login headline alone uses Newsreader (serif), as in the original design.
