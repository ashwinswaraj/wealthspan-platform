export const LEDGER_SECTIONS = [
  { key: "income", label: "Income" },
  { key: "expense", label: "Expense" },
  { key: "debt-loan", label: "Debt & loan/EMI etc" },
  { key: "savings-investing", label: "Savings & Investing" },
  { key: "festivals-functions", label: "Festivals & functions" },
] as const;

export type LedgerSectionKey = (typeof LEDGER_SECTIONS)[number]["key"];
