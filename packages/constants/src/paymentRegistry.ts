import { useSyncExternalStore } from "react";
import { ORDERS } from "./orders";

export type PaymentStatus = "pending" | "verified" | "failed" | "refunded";
export type PaymentMethod = "UPI" | "Card" | "Bank Transfer" | "Offline";
export type PaymentRow = {
  id: string;
  orderId: string;
  invoiceNo: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  createdAt: string;
  verifiedAt?: string;
};

const KEY = "jobrio.finance.payments";
const listeners = new Set<() => void>();
const load = (): PaymentRow[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]") as PaymentRow[];
  } catch {
    return [];
  }
};
let rows = load();
if (rows.length === 0 && typeof window !== "undefined") {
  rows = ORDERS.filter(
    (o) => !!o.invoiceNo && o.s !== "awaiting_payment" && o.s !== "pending" && o.s !== "rejected",
  ).map((o) => ({
    id: `PAY-SEED-${o.id}`,
    orderId: o.id,
    invoiceNo: o.invoiceNo!,
    amount: o.amountNum,
    method: "UPI" as PaymentMethod,
    status: o.s === "cancelled" ? ("refunded" as PaymentStatus) : ("verified" as PaymentStatus),
    reference: `SEED-${o.id}`,
    createdAt: o.invoiceDate ? new Date(o.invoiceDate).toISOString() : new Date().toISOString(),
    verifiedAt: o.invoiceDate ? new Date(o.invoiceDate).toISOString() : new Date().toISOString(),
  }));
}
const persist = () => {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(rows));
};
const notify = () => listeners.forEach((l) => l());

export const getPaymentRegistrySnapshot = () => rows;
export const subscribePaymentRegistry = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const addPayment = (payment: PaymentRow) => {
  rows = [payment, ...rows.filter((p) => p.id !== payment.id)];
  persist();
  notify();
  return payment;
};
export const updatePayment = (id: string, patch: Partial<PaymentRow>) => {
  rows = rows.map((p) => (p.id === id ? { ...p, ...patch } : p));
  persist();
  notify();
  return rows.find((p) => p.id === id);
};
export const findPaymentByOrder = (orderId: string) => rows.find((p) => p.orderId === orderId);

if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      rows = load();
      notify();
    }
  });
export const usePaymentRegistry = () =>
  useSyncExternalStore(
    subscribePaymentRegistry,
    getPaymentRegistrySnapshot,
    getPaymentRegistrySnapshot,
  );
