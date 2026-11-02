# UI/UX Guidelines

> Status: Draft · Last updated: 2026-11-01

- **Mobile first.** Bottom navigation, thumb-reachable add-entry button. The app should feel like a calm paper ledger, not a trading screen.
- **Sheets like Excel.** Each section (Income, Expense, Debt & Loan/EMI, Savings & Investing, Festivals & functions, plus Accounts) is a grid with the columns defined in `packages/constants/src/sheets.ts`. Users type rupees; the API stores paise.
- **Rupee formatting** in the Indian system (lakh/crore grouping) via shared utils, never ad hoc.
- **Honest numbers.** Totals come from `packages/utils/src/finance.ts`. Open-event spending is shown on its own line and not in Expense until the event is concluded.
- **Warn before double counting.** Card-bill-looking expenses offer "record as transfer".
- **Confirm what is hard to undo.** Delete, conclude/reopen event, and (later) chatbot edits show what will change first. Creates show Undo.
- **Plain language, no jargon**, English plus Hindi/Hinglish in chat. Error messages say what to do next.
- **Every screen has loading, empty and error states** from the design system.
- **Accessibility:** visible focus, labels on inputs, colour never the only signal for income vs expense.
- **No fake data.** No invented user counts, balances or trust badges.
