**The owner wants an exact visual copy** of the original app. Screens are ported from the original's rendered markup/classes (Tailwind), re-split into Wealthspan-style feature components; behaviour is rebuilt against the Catalyst backend.

# Wealthspan frontend plan

Source of screens: the owner's compiled `wealthspan.html` (reference only — Firebase/Gemini,
no source). We rebuild each screen inside `apps/web` following root `AGENTS.md` §3:
one feature folder per domain, barrel `index.ts`, thin `pages/`, thin `routes/`.
UI comes from `@wealthspan/ui/design-system`. Money maths only through `@wealthspan/utils/finance`.

Do NOT copy from the HTML: fake admin numbers (users, ₹ Cr vault, "audited by CertiK",
"RBI custody"), leftover "OpenAI"/"Gemini" strings, browser-side money maths.

## Slices (each ends with typecheck + screenshot review)

| #   | Feature folder                                                       | What                                                                                                                                                                       | Status      |
| --- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | `wealthspan-shell`, `wealthspan-auth`, `projects`, `services/api.ts` | App shell (bottom nav), login screen, projects list/add/delete                                                                                                             | built       |
| 2   | `sheets`                                                             | Per project: 5 sections (Income, Expense, Debt/EMI, Savings & Investing, Festivals) as Excel-style sheets from `packages/constants/src/sheets.ts`, payment mode, transfers | in progress |
| 3   | `accounts`                                                           | Cash/bank/card/wallet with balances, card-bill transfer                                                                                                                    | todo        |
| 4   | `accountant-chat`                                                    | Chat + tool confirmations, voice later                                                                                                                                     | todo        |
| 5   | `exports`                                                            | PDF/Excel/Word/CSV download sheet (files function)                                                                                                                         | todo        |
| 6   | `budgets`, `notifications`                                           | Monthly caps per category                                                                                                                                                  | todo        |
| 7   | `subscription`                                                       | Trial, plans, UTR submit; admin approval in `apps/admin`                                                                                                                   | todo        |
| 8   | `account-settings`                                                   | Profile, theme, data controls, delete account                                                                                                                              | todo        |
| 9   | `marketing`                                                          | Landing page copy and branding                                                                                                                                             | todo        |

## Known open decisions

- **Hosting (decided)**: the web app is built as a static SPA (`pnpm build:client`) and served by
  Catalyst Web Client Hosting under `/app/` (admin under `/app/admin/`), same domain as
  `/server/<function>`, so the session cookie works.
- **Login (decided)**: Catalyst Embedded Authentication (Google / Zoho / email); there is no custom
  `auth` function or custom token.
- **Payment gateway**: TBD. Slice 7 uses manual UPI + UTR with admin approval.
