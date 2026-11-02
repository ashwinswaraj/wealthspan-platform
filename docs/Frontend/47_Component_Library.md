# Component Library

> Status: Draft · Last updated: 2026-11-01

## Purpose

Inventory of what actually exists in `@wealthspan/ui/design-system` today.

## Details

### `primitives/`

`Button`, `Input`, `AuthInput`, `Avatar`, `Badge`, `ProgressBar`,
`PasswordStrength`, `Skeleton`, `Spinner`, `WealthspanToolbar`

### `layout/`

`Card`, `Container`, `PageHeader`, `StatCard`

### `feedback/`

`EmptyState`, `ErrorState`, `FieldError`, `LoadingState`, `PageSkeletons`,
`SpinnerOverlay`, plus a `useSkeletonState` hook

### `motion/`

`transitions.ts` — shared transition definitions consumed alongside the
`motion` tokens (see `48_Design_Tokens.md`)

### `icons/`

A single `index.ts` export surface

Beyond the design system, `@wealthspan/ui` has two more layers:

- `packages/ui/src/components/` — the underlying shadcn/ui primitive layer
  (49 components: `button`, `card`, `dialog`, `dropdown-menu`, `form`,
  `calendar`, `chart`, etc.) that `design-system/primitives/` and
  `layout/` are themselves built on top of.
- `packages/ui/src/shared/` — higher-level shared components that don't
  fit the core design-system surface (`AuditListPage`, `SidebarToggleIcon`,
  `NotificationBellIcon`, `ChatConversation`, `AnimatedPlaceholder`, and
  some leftovers from the previous product that are candidates for removal).
  Check the folder for the current list.

## Open Questions

- [ ] No Storybook or visual catalog exists yet — this file is the only
      current inventory
- [ ] No documented criteria for what belongs in `design-system/` vs.
      `shared/` vs. `components/` within `@wealthspan/ui`

## References

- `packages/ui/src/design-system/`
- `packages/ui/src/shared/`, `packages/ui/src/components/`
- `45_Design_System.md`
