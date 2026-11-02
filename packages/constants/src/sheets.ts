/**
 * The Excel-style sheets of Wealthspan. ONE definition per dashboard, shared by the web grid and (next) the
 * chatbot's tools, so the AI edits exactly the rows and columns the user sees.
 *
 * Column `key`s are the API's input field names. Money columns are typed in RUPEES; the API stores
 * `<key>Paise` (amount -> amountPaise, principal -> principalPaise, ...). Where a record field has a
 * different name from its input (it never does today) add it here, not in the UI.
 */
import {
  EXPENSE_CATEGORIES,
  FINANCE_EVENT_STATUSES,
  INCOME_CATEGORIES,
  INVESTMENT_KINDS,
  LOAN_STATUSES,
  PAYMENT_MODES,
  ACCOUNT_KINDS,
} from "./finance";

export const SHEET_KEYS = [
  "income",
  "expense",
  "debt-loan",
  "savings-investing",
  "festivals-functions",
  "accounts",
  "project",
] as const;
export type SheetKey = (typeof SHEET_KEYS)[number];

export type SheetSource = "transactions" | "accounts" | "loans" | "investments" | "events";
export type SheetColumnType = "text" | "money" | "number" | "date" | "select" | "ref";
export type SheetRef = "projects" | "accounts" | "events" | "loans" | "investments";

export interface SheetOption {
  value: string;
  label: string;
}

export interface SheetColumn {
  key: string;
  label: string;
  type: SheetColumnType;
  /** Pixel width of the column in the grid. */
  width: number;
  required?: boolean;
  /** For type "select". */
  options?: readonly SheetOption[];
  /** For type "ref": which list of the user's own records the cell points at. */
  ref?: SheetRef;
  /** Money column that is added up in the footer. */
  sum?: boolean;
  /** Shown and filled by the server, never typed. */
  readOnly?: boolean;
}

export interface SheetDef {
  key: SheetKey;
  title: string;
  subtitle: string;
  source: SheetSource;
  /** Values every row of this sheet has (e.g. type = income). Sent on create, used as a filter on read. */
  fixed?: Record<string, string>;
  columns: readonly SheetColumn[];
  /** Used in the empty-state sentence: "No <noun> details found for …". */
  noun: string;
  addLabel: string;
  /** Column the rows are sorted by, newest first. */
  sortKey: string;
}

const opts = (list: readonly string[]): SheetOption[] => list.map((v) => ({ value: v, label: v }));
const pretty = (v: string) => v.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const enumOpts = (list: readonly string[]): SheetOption[] =>
  list.map((v) => ({ value: v, label: pretty(v) }));
const modeOpts: SheetOption[] = PAYMENT_MODES.map((m) => ({ value: m.id, label: m.label }));

const common = {
  date: { key: "date", label: "Date", type: "date", width: 128, required: true },
  amount: {
    key: "amount",
    label: "Amount (₹)",
    type: "money",
    width: 120,
    required: true,
    sum: true,
  },
  project: {
    key: "projectId",
    label: "Project",
    type: "ref",
    ref: "projects",
    width: 140,
    required: true,
  },
  account: {
    key: "accountId",
    label: "Account",
    type: "ref",
    ref: "accounts",
    width: 140,
    required: true,
  },
  mode: {
    key: "paymentMode",
    label: "Mode",
    type: "select",
    options: modeOpts,
    width: 130,
    required: true,
  },
  note: { key: "note", label: "Note", type: "text", width: 200 },
} as const satisfies Record<string, SheetColumn>;

export const SHEETS: Record<SheetKey, SheetDef> = {
  income: {
    key: "income",
    title: "Income",
    subtitle: "Wealthspan · Ledger",
    source: "transactions",
    fixed: { type: "income" },
    noun: "income",
    addLabel: "Record income entry",
    sortKey: "date",
    columns: [
      common.date,
      common.amount,
      {
        key: "category",
        label: "Category",
        type: "select",
        options: opts(INCOME_CATEGORIES),
        width: 170,
        required: true,
      },
      { key: "source", label: "Income source", type: "text", width: 150 },
      { key: "party", label: "From", type: "text", width: 140 },
      common.project,
      common.account,
      common.mode,
      common.note,
    ],
  },
  expense: {
    key: "expense",
    title: "Expense",
    subtitle: "Wealthspan · Ledger",
    source: "transactions",
    fixed: { type: "expense" },
    noun: "expense",
    addLabel: "Record expense entry",
    sortKey: "date",
    columns: [
      common.date,
      common.amount,
      {
        key: "category",
        label: "Category",
        type: "select",
        options: opts(EXPENSE_CATEGORIES),
        width: 170,
        required: true,
      },
      { key: "party", label: "Paid to", type: "text", width: 140 },
      common.project,
      common.account,
      common.mode,
      { key: "eventId", label: "Festival / function", type: "ref", ref: "events", width: 160 },
      { key: "loanId", label: "Loan (EMI)", type: "ref", ref: "loans", width: 140 },
      common.note,
    ],
  },
  "debt-loan": {
    key: "debt-loan",
    title: "Debt & loan/EMI etc",
    subtitle: "Wealthspan · Ledger",
    source: "loans",
    noun: "debt / EMI",
    addLabel: "Record debt / EMI entry",
    sortKey: "startDate",
    columns: [
      { key: "lender", label: "Lender", type: "text", width: 160, required: true },
      {
        key: "principal",
        label: "Loan amount (₹)",
        type: "money",
        width: 130,
        required: true,
        sum: true,
      },
      { key: "interestRatePct", label: "Interest %", type: "number", width: 100 },
      { key: "emi", label: "EMI (₹)", type: "money", width: 110, sum: true },
      { key: "emiDayOfMonth", label: "EMI day", type: "number", width: 90 },
      { key: "startDate", label: "Start date", type: "date", width: 128 },
      { key: "tenureMonths", label: "Months", type: "number", width: 90 },
      common.project,
      {
        key: "status",
        label: "Status",
        type: "select",
        options: enumOpts(LOAN_STATUSES),
        width: 110,
      },
    ],
  },
  "savings-investing": {
    key: "savings-investing",
    title: "Savings & Investing",
    subtitle: "Wealthspan · Ledger",
    source: "investments",
    noun: "savings / investment",
    addLabel: "Record savings / investment entry",
    sortKey: "name",
    columns: [
      { key: "name", label: "Name", type: "text", width: 180, required: true },
      {
        key: "kind",
        label: "Type",
        type: "select",
        options: enumOpts(INVESTMENT_KINDS),
        width: 170,
        required: true,
      },
      { key: "currentValue", label: "Current value (₹)", type: "money", width: 140, sum: true },
      { key: "folioNo", label: "Folio / account no.", type: "text", width: 160 },
      common.project,
    ],
  },
  "festivals-functions": {
    key: "festivals-functions",
    title: "Festivals & functions",
    subtitle: "Wealthspan · Ledger",
    source: "events",
    noun: "festival / function",
    addLabel: "Record festival / function entry",
    sortKey: "startDate",
    columns: [
      { key: "name", label: "Festival / function", type: "text", width: 200, required: true },
      common.project,
      { key: "budget", label: "Budget (₹)", type: "money", width: 120, sum: true },
      { key: "startDate", label: "Start", type: "date", width: 128 },
      { key: "endDate", label: "End", type: "date", width: 128 },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "open", label: "Open" },
          { value: "concluded", label: "Concluded" },
        ],
        width: 120,
      },
    ],
  },
  accounts: {
    key: "accounts",
    title: "Accounts",
    subtitle: "Wealthspan · Ledger",
    source: "accounts",
    noun: "account",
    addLabel: "Add account",
    sortKey: "name",
    columns: [
      { key: "name", label: "Account name", type: "text", width: 180, required: true },
      {
        key: "kind",
        label: "Type",
        type: "select",
        options: enumOpts(ACCOUNT_KINDS),
        width: 130,
        required: true,
      },
      { key: "openingBalance", label: "Opening balance (₹)", type: "money", width: 150, sum: true },
      { key: "creditLimit", label: "Credit limit (₹)", type: "money", width: 140 },
    ],
  },
  // A project's own dashboard: every income and expense of that project in one sheet.
  project: {
    key: "project",
    title: "Project",
    subtitle: "Wealthspan · Project sheet",
    source: "transactions",
    noun: "project",
    addLabel: "Add entry",
    sortKey: "date",
    columns: [
      common.date,
      {
        key: "type",
        label: "Type",
        type: "select",
        options: [
          { value: "income", label: "Income" },
          { value: "expense", label: "Expense" },
        ],
        width: 110,
        required: true,
      },
      common.amount,
      {
        key: "category",
        label: "Category",
        type: "select",
        options: opts([
          ...INCOME_CATEGORIES,
          ...EXPENSE_CATEGORIES.filter(
            (c) => !(INCOME_CATEGORIES as readonly string[]).includes(c),
          ),
        ]),
        width: 170,
        required: true,
      },
      { key: "party", label: "Party", type: "text", width: 140 },
      common.account,
      common.mode,
      common.note,
    ],
  },
};

export const sheetFor = (key: SheetKey): SheetDef => SHEETS[key];
/** FINANCE_EVENT_STATUSES stays the single source for event states; kept in sync with the select above by a test. */
export const EVENT_STATUS_VALUES = FINANCE_EVENT_STATUSES;
