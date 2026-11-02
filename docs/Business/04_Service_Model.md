# Service Model

> Status: Draft · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

What Wealthspan delivers to a subscriber and how.

## What the user gets

| Capability                                         | How                                                                            | Status                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------- |
| Projects, one per business / income source         | Catalog routes `/projects`                                                     | Built (API)                   |
| Five sections per project as Excel-style sheets    | `SHEETS` in `packages/constants/src/sheets.ts`; `apps/web/src/features/sheets` | Built                         |
| Accounts with computed balances                    | `/accounts`, `packages/utils/src/finance.ts`                                   | Built (API)                   |
| AI accountant chat                                 | `apps/api/src/features/chat` (Sarvam)                                          | Endpoint built; tools Planned |
| Exports: PDF, Excel, CSV, Word                     | `GET /server/files/export`                                                     | Built                         |
| Summary and reports (calendar or April–March year) | `GET /summary`                                                                 | Built                         |

## Delivery

Web app under `/app/` (mobile-first layout with bottom navigation). No native app, SMS reader or bank auto-connect in Phase 1.

## Support

Handled by e-mail and the admin panel (see `Admin/` docs); no live chat support is planned for Phase 1.
