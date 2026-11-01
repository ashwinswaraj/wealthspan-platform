# Wealthspan Design System

`src/design-system/` is the ONLY sanctioned UI layer for the Wealthspan app.

## Rules

1. Pages and features import UI from `@wealthspan/ui/design-system` — never from
   `@wealthspan/ui/components/*` directly. The shadcn primitives under `components/ui`
   are internal building blocks for the design system.
2. Never introduce a new color, font, radius, shadow, spacing value, or
   component variation inside a feature. Add it here first, get it approved,
   then reuse it everywhere.
3. Do not create page-specific UI. If a page needs something new, add it to
   `src/design-system/` under the correct folder and re-export it from
   `src/design-system/index.ts`.
4. Icons come from `lucide-react` only, at `strokeWidth={1.5}`, sized from
   the `iconSizes` token scale.
5. The Audit & Logs module is intentionally excluded from the harvesting
   pass — its patterns are not used as references for the kit.

## Locked references

- **Primary Button** = the Super Admin → Professional Applications "Review"
  action. **Secondary Button** = Approve / Reject / Request Info.
- **Auth inputs** (Sign In / Sign Up / Forgot Password) = the treatment in
  `src/components/signup/FormField.tsx`. Use `AuthInput`, `AuthSelect`,
  `AuthTextarea`.
- **Dashboard inputs** = Services Desk → Create Service (`SDInput` / `SDSelect`
  / `SDTextarea`). Use `Input`, `Select`, `Textarea`.
- **AuthContainer** wraps auth surfaces. **DashboardContainer** wraps every
  authenticated page. No third container is allowed.

## Folder shape

```
src/design-system/
  index.ts            ← the ONLY import surface
  tokens/             colors / typography / spacing / radius / elevation /
                      opacity / zIndex / motion / breakpoints / icons
  primitives/         Button, Input, Select, Textarea, AuthInput family,
                      Badge/Tag/StatusChip, Avatar, Skeleton family,
                      Spinner, ProgressBar
  layout/             AuthContainer, DashboardContainer, SectionContainer,
                      Card, StatCard, PageHeader, SectionHeader
  feedback/           EmptyState, ErrorState, LoadingState
  icons/              lucide-react re-export + size/stroke tokens
  motion/             transition presets
```

Usage:

```ts
import { Button, Input, DashboardContainer, PageHeader, StatCard } from "@wealthspan/ui/design-system";
```
