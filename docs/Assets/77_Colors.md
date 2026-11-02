# Colors

> Status: Draft · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

Record the actual brand/UI color values, sourced directly from
`apps/web/src/styles.css`'s `:root` block (the single place raw HSL values
are defined — `packages/ui/src/design-system/tokens/index.ts` only
references these via CSS variables, it doesn't duplicate the numbers).

## Details

All values are `hsl(H S% L%)`. Only one `:root` color set exists; a `.dark` class exists but only swaps the logo tile and mark colors.

| Token                                                 | HSL            | Role                         |
| ----------------------------------------------------- | -------------- | ---------------------------- |
| `--primary` / `--primary-container`                   | `218 100% 39%` | Brand blue                   |
| `--secondary`                                         | `215 18% 39%`  | Secondary brand color        |
| `--tertiary`                                          | `160 100% 16%` | Tertiary accent              |
| `--background` / `--surface`                          | `210 33% 98%`  | App background               |
| `--foreground` / `--on-surface`                       | `210 14% 11%`  | Primary text                 |
| `--card` / `--popover` / `--surface-container-lowest` | `0 0% 100%`    | Elevated white surfaces      |
| `--muted` / `--accent` / `--surface-container-low`    | `210 20% 96%`  | Subtle backgrounds           |
| `--border` / `--input`                                | `216 18% 91%`  | Borders and input outlines   |
| `--destructive`                                       | `0 84% 60%`    | Error/destructive actions    |
| `--ring`                                              | `218 100% 39%` | Focus ring (matches primary) |
| `--outline`                                           | `229 7% 48%`   | Structural outlines          |

`--radius` base value is `0.5rem` (see `docs/Frontend/48_Design_Tokens.md`
for the derived `radius` scale).

## Open Questions

- [ ] A full dark-mode palette is not built; confirm whether it is planned

## References

- `apps/web/src/styles.css` (`:root` block)
- `packages/ui/src/design-system/tokens/index.ts`
