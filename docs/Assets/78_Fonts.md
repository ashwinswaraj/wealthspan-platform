# Fonts

> Status: Draft · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

Record the actual typefaces in use, sourced from
`packages/ui/src/design-system/tokens/index.ts`'s `typography.family` and
confirmed in `apps/web/src/styles.css`'s `--font-*` variables.

## Details

| Role | Font | CSS variable |
| --- | --- | --- |
| Headline (display, h1–h4) | Manrope | `--font-headline` |
| Body | Inter | `--font-body` |
| Label | Inter | `--font-label` |

Both are sans-serif; body and label share the same typeface (Inter),
headline uses a distinct one (Manrope) for visual hierarchy. See
`docs/Frontend/48_Design_Tokens.md` for the full `typography.scale`
(display down to caption).

## Open Questions

- [ ] Font-loading strategy (self-hosted vs. a font CDN like Google Fonts)
      isn't visible from the token file alone — check the actual `<head>`/
      font-loading setup before assuming either way

## References

- `packages/ui/src/design-system/tokens/index.ts`
- `apps/web/src/styles.css`
