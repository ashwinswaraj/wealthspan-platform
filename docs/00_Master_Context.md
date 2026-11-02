# Master Context

Status: MASTER / CANONICAL · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

The entry point for understanding Wealthspan: what it is, how it is built and what is (and is not) shipped. Other docs must stay consistent with this one unless a change is explicitly approved.

## What Wealthspan is

**Wealthspan — "The full arc of your money."** An AI personal-accountant app for people in India who earn from more than one place (salary, a shop, freelance work, rent) and want all of it in one set of books.

## Core concepts

- **Project** — a "money space" with its own profit and loss: Personal, or one per business / income source that has its own costs. Created by the user.
- **Five sections per project** — Income, Expense, Debt & Loan/EMI, Savings & Investing, Festivals & functions. Festival spending moves into Expense when the event is concluded (nothing is duplicated).
- **Accounts** — where money sits: cash, bank, credit card, wallet. Balance = opening + income − expense − transfers out + transfers in.
- **Transactions** — one table for all money movement: `income`, `expense`, `transfer`. Transfers (card-bill payment, cash deposit, money put into an investment) never count as income or expense.
- **Sheets** — each section is an Excel-style grid, defined once in `packages/constants/src/sheets.ts` (`SHEETS`) and shared by the web grid and the chatbot.
- **AI accountant** — a chatbot (Sarvam `sarvam-105b`, `apps/api/src/features/chat`) that reads and writes the same sheets through fixed tools; the server decides whether a call needs the user's confirmation.
- **Money** is stored as integer paise; dates are `YYYY-MM-DD`; records are soft-deleted (30-day recovery) and carry `created_by` (`manual` / `chatbot` / `system`).

## Architecture in one view

| Layer        | What                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| `apps/web`   | TanStack Start SPA, served under `/app/` via Catalyst Web Client Hosting                                 |
| `apps/admin` | Admin panel: users, subscriptions, catalog, plans, roles                                                 |
| `apps/api`   | Catalyst Advanced I/O functions: `finance` (transactions, catalog, subscription, admin), `chat`, `files` |
| Data         | Zoho Catalyst Data Store (ZCQL); every row keyed by `user_id`                                            |
| Auth         | Catalyst Cloud Scale Embedded Authentication (Google / Zoho / email)                                     |
| Monorepo     | pnpm + Turborepo; shared logic in `packages/*` (money maths only in `@wealthspan/utils`)                 |

There is no custom auth function; sign-in is Catalyst-hosted.

## What is shipped vs planned

| Area                                                                                       | Status                                                            |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Transactions API, catalog routes (projects, accounts, events, loans, investments), summary | Built in code; not yet verified on live Catalyst                  |
| Sheets (Excel-style grids) in web                                                          | Built (`apps/web/src/features/sheets`)                            |
| Chat endpoint with Sarvam and a daily quota (40 messages/user)                             | Built                                                             |
| Chatbot tools (create / update / delete / confirm flow)                                    | Planned: policy defined in `CHATBOT_TOOL_POLICY`, tools not built |
| File exports: PDF, Excel, CSV, Word                                                        | Built (`features/files`)                                          |
| Subscriptions: free 30-day "Go" trial, Pro monthly / annual, manual UPI payment review     | Built; payment gateway TBD                                        |
| Admin panel                                                                                | Built (users directory, subscriptions, payments, ledger, audit)   |
| SMS reading, bank auto-connect, Account Aggregator                                         | Phase 2                                                           |
| GST / tax filing, multi-user roles, forecasts                                              | Phase 3                                                           |

## Terminology

See [Glossary](Business/08_Glossary.md). Product behaviour is in [Product](Product/); data rules in [Data Model](Database/41_Wealthspan_Data_Model.md); frontend slices in [Frontend Plan](Frontend/Wealthspan_Frontend_Plan.md).

## Principles

1. The user's numbers come from code (`packages/utils/src/finance.ts`), never from the model; the model only explains them.
2. The chatbot never touches the database; identity comes from the login token only.
3. Never count the same rupee twice (transfers, open events, card bills).
4. Do not claim features that are not built; mark them Planned / TBD.
