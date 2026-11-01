**The owner wants an exact visual copy** of the original app. Screens are ported from the original's rendered markup/classes (Tailwind), re-split into Wealthspan-style feature components; behaviour is rebuilt against the Catalyst backend.

# Wealthspan frontend — conversion plan (Wealthspan shape, Wealthspan content)

Source of screens: the owner's compiled `wealthspan.html` (reference only — Firebase/Gemini,
no source). We rebuild each screen inside `apps/web` following root `AGENTS.md` §3:
one feature folder per domain, barrel `index.ts`, thin `pages/`, thin `routes/`.
UI comes from `@wealthspan/ui/design-system`. Money maths only through `@wealthspan/utils/finance`.

Do NOT copy from the HTML: fake admin numbers (users, ₹ Cr vault, "audited by CertiK",
"RBI custody"), leftover "OpenAI"/"Gemini" strings, client-side money maths.

## Slices (each ends with typecheck + screenshot review)

| # | Feature folder | What | Status |
|---|---|---|---|
| 1 | `wealthspan-shell`, `wealthspan-auth`, `projects`, `services/api.ts`, route `/app` | App shell (bottom nav), login screen, projects list/add/delete | in progress |
| 2 | `ledger` | Per project: 5 sections (Income, Expense, Debt/EMI, Savings & Investing, Festivals), entry table + add-entry form with payment mode, transfers | todo |
| 3 | `accounts` | Cash/bank/card/wallet with balances, card-bill transfer | todo |
| 4 | `accountant-chat` | Chat + tool confirmations, voice later | todo |
| 5 | `exports` | PDF/Excel/Word/CSV download sheet (files function) | todo |
| 6 | `budgets`, `notifications` | Monthly caps per category | todo |
| 7 | `subscription` | Trial, plans, UTR submit; admin approval in `apps/admin` | todo |
| 8 | `account-settings` | Profile, theme, data controls, delete account | todo |
| 9 | `marketing` | Replace Wealthspan copy/branding with Wealthspan | todo |

## Known open decisions
- **Hosting**: TanStack Start is SSR; Catalyst Web Client hosting is static. Session cookies only
  work if the app and the functions share a domain. Decide before slice 2 goes live.
- **Session after login**: `auth` function returns a Catalyst custom token; how the browser turns
  it into a session (`services/session.ts`) is unverified until the domain/mail works.
