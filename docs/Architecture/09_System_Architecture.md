# System Architecture

> Status: Draft · Last updated: 2026-11-01

```
Browser (apps/web SPA at /app/, apps/admin SPA at /app/admin/)
   |  same domain, session cookie, header X-Requested-With: wealthspan
   v
Zoho Catalyst (India DC)
   Web Client Hosting  -> static SPAs
   Embedded Auth       -> Google / Zoho / email login, session
   /server/finance     -> transactions, catalog, subscription, admin
   /server/chat        -> AI accountant  --HTTPS-->  Sarvam (sarvam-105b)
   /server/files       -> PDF / Excel / CSV / Word
   Data Store (ZCQL)   -> projects, accounts, transactions, loans, investments,
                          events, audit_log, subscriptions, payment_submissions, chat_usage
```

## Components

- **apps/web**: TanStack Start SPA built as static files (`pnpm build:client`). Projects with five sections (Income, Expense, Debt & Loan/EMI, Savings & Investing, Festivals & functions) plus Accounts, shown as Excel-style sheets defined once in `packages/constants/src/sheets.ts`.
- **apps/admin**: operator panel; admin identity pinned by env vars.
- **apps/api**: the three functions; shared rules in `packages/*`.
- **Sarvam**: the only third party that sees user text (chat messages). Behind one adapter file.

## Not in Phase 1

SMS reader, Account Aggregator, bank connections (Phase 2); GST/tax filing, multi-user roles, forecasts (Phase 3). Payment gateway: TBD.

See ADR-001 to ADR-004 for the reasons.
