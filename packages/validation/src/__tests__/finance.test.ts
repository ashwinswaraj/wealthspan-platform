import { describe, it, expect } from "vitest";
import {
  validateAmountRupees,
  validateDate,
  validateTransactionInput,
  validatePaymentModeForAccount,
  validateProjectInput,
  validateAccountInput,
  validateLoanInput,
  validateEventInput,
  parseRupees,
} from "../finance";

const okExpense = {
  type: "expense",
  amount: "500",
  date: "2026-10-05",
  projectId: "p1",
  accountId: "a1",
  paymentMode: "upi",
  category: "Food & Groceries",
};

describe("amount and date", () => {
  it("parses typed rupees", () => {
    expect(parseRupees("₹1,200.50")).toBe(1200.5);
    expect(parseRupees("abc")).toBeNull();
  });
  it("validates amounts", () => {
    expect(validateAmountRupees("500")).toBeNull();
    expect(validateAmountRupees("")).toBe("Amount is required.");
    expect(validateAmountRupees("0")).toBe("Amount must be greater than 0.");
    expect(validateAmountRupees("-5")).toBe("Amount must be a number.");
    expect(validateAmountRupees("10.555")).toBe("Amount can have at most 2 decimal places.");
    expect(validateAmountRupees("99999999999")).toMatch(/too large/);
  });
  it("validates dates", () => {
    expect(validateDate("2026-10-05")).toBeNull();
    expect(validateDate("2026-02-30")).toMatch(/valid date/);
    expect(validateDate("05/10/2026")).toMatch(/valid date/);
    expect(validateDate("2028-01-01", "2026-10-05")).toMatch(/future/);
  });
});

describe("transactions", () => {
  it("accepts a complete expense and income", () => {
    expect(validateTransactionInput(okExpense)).toEqual({});
    expect(validateTransactionInput({ ...okExpense, type: "income", source: "Shop sales", category: "Business Sales" })).toEqual({});
  });
  it("payment mode is required and must be from the fixed list", () => {
    expect(validateTransactionInput({ ...okExpense, paymentMode: "" }).paymentMode).toBe("Payment mode is required.");
    expect(validateTransactionInput({ ...okExpense, paymentMode: "GPay maybe" }).paymentMode).toMatch(/valid payment mode/);
  });
  it("account, project and category are required for income/expense", () => {
    const e = validateTransactionInput({ type: "expense", amount: "10", date: "2026-10-05", paymentMode: "cash" });
    expect(Object.keys(e).sort()).toEqual(["accountId", "category", "projectId"]);
  });
  it("transfer needs two different accounts and no project/category", () => {
    expect(validateTransactionInput({ type: "transfer", amount: "5000", date: "2026-10-20", fromAccountId: "bank", toAccountId: "card" })).toEqual({});
    expect(validateTransactionInput({ type: "transfer", amount: "5000", date: "2026-10-20", fromAccountId: "bank", toAccountId: "bank" }).toAccountId).toMatch(/different/);
    const e = validateTransactionInput({ type: "transfer", amount: "5000", date: "2026-10-20", fromAccountId: "a", toAccountId: "b", projectId: "p1", category: "Shopping" });
    expect(e.projectId).toBeDefined();
    expect(e.category).toBeDefined();
  });
  it("links go only where they belong", () => {
    expect(validateTransactionInput({ ...okExpense, type: "income", eventId: "e1" }).eventId).toBeDefined();
    expect(validateTransactionInput({ ...okExpense, source: "Salary" }).source).toBeDefined();
    expect(validateTransactionInput({ ...okExpense, loanId: "l1" })).toEqual({});
    expect(validateTransactionInput({ ...okExpense, investmentId: "i1" }).investmentId).toBeDefined();
  });
  it("rejects an unknown type", () => {
    expect(validateTransactionInput({ ...okExpense, type: "sale" }).type).toMatch(/income, expense or transfer/);
  });
});

describe("payment mode vs account kind", () => {
  it("matches the right pairs", () => {
    expect(validatePaymentModeForAccount("cash", "cash")).toBeNull();
    expect(validatePaymentModeForAccount("credit_card", "credit_card")).toBeNull();
    expect(validatePaymentModeForAccount("upi", "wallet")).toBeNull();
    expect(validatePaymentModeForAccount("cash", "bank")).not.toBeNull();
    expect(validatePaymentModeForAccount("credit_card", "bank")).not.toBeNull();
  });
});

describe("projects, accounts, loans, events", () => {
  it("project", () => {
    expect(validateProjectInput({ name: "Kirana Shop", kind: "business" })).toEqual({});
    expect(validateProjectInput({ name: "", kind: "x" })).toEqual({
      name: "Project name is required.",
      kind: "Project type must be personal or business.",
    });
  });
  it("account", () => {
    expect(validateAccountInput({ name: "HDFC savings", kind: "bank", openingBalance: "12000" })).toEqual({});
    expect(validateAccountInput({ name: "Cash", kind: "cash", creditLimit: "5000" }).creditLimit).toMatch(/only for credit cards/);
    expect(validateAccountInput({ name: "SBI card", kind: "credit_card", creditLimit: "100000" })).toEqual({});
  });
  it("loan", () => {
    expect(validateLoanInput({ projectId: "p", lender: "SBI", principal: "50000", emi: "3000", emiDayOfMonth: 10, interestRatePct: 11 })).toEqual({});
    const e = validateLoanInput({ projectId: "p", lender: "SBI", principal: "0", emiDayOfMonth: 40, interestRatePct: 120 });
    expect(Object.keys(e).sort()).toEqual(["emiDayOfMonth", "interestRatePct", "principal"]);
  });
  it("event", () => {
    expect(validateEventInput({ projectId: "p", name: "Diwali 2026", budget: "50000", startDate: "2026-10-20", endDate: "2026-11-02" })).toEqual({});
    expect(validateEventInput({ projectId: "p", name: "Diwali", startDate: "2026-11-02", endDate: "2026-10-20" }).endDate).toMatch(/before/);
  });
});
