# Dashboard

> Status: Active (core shipped) · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

The signed-in landing screen: one place to see the full arc of the user's money.

## What exists

- **Projects** (`apps/web/src/features/projects`): one per business or income source, plus Personal. Each project has five sections: Income, Expense, Debt & Loan/EMI, Savings & Investing, Festivals & functions.
- **Sheets** (`apps/web/src/features/sheets`): an Excel-style grid per section, defined once in `packages/constants/src/sheets.ts` (`SHEETS`) and shared with the chatbot.
- **Summary**: `GET /finance/summary` computes income, expense, profit and balances with `packages/utils/src/finance.ts`. Numbers never come from the AI.
- Money is shown in rupees and stored as integer paise.

## Not in scope

Forecasts, GST and tax views are Phase 3 (see the data model, section 9).

## References

- [Data model](../Database/41_Wealthspan_Data_Model.md)
