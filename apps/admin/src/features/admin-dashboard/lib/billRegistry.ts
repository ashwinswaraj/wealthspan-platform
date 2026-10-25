import { useSyncExternalStore } from "react";
import {
  getOrderRegistrySnapshot,
  updateOrderInRegistry,
  addNotification,
} from "@jobrio/constants";

/**
 * Billing Center registry (admin-only).
 *
 * Bills are an admin-side finance artifact — clients never create them —
 * so this lives in the admin app rather than the shared constants package.
 * Still follows the exact same reactive-registry pattern as the shared
 * service/order/notification registries: a persisted snapshot that every
 * subscriber re-renders from immediately.
 *
 * When a bill's id matches a live order in the shared order registry,
 * generating its invoice also flips that order to "Awaiting Payment"
 * everywhere (Order Desk, Global Search, etc.) — the same cross-linking
 * already wired for orders approved from the Order Desk.
 */

export type BillTab = "pending" | "awaiting" | "paid";

export type BillRow = {
  id: string;
  client: string;
  service: string;
  value: number;
  tax: number;
  discount: number;
  status: BillTab;
  invoiceNo?: string;
  invoiceDate?: string;
  paymentDue?: string;
};

const SEED: BillRow[] = [
  {
    id: "JR-1051",
    client: "Initech",
    service: "Logo Design",
    value: 4800,
    tax: 864,
    discount: 0,
    status: "pending",
  },
  {
    id: "JR-1048",
    client: "Globex",
    service: "Explainer Video",
    value: 12500,
    tax: 2250,
    discount: 500,
    status: "pending",
  },
  {
    id: "JR-1041",
    client: "Hooli",
    service: "Landing Page Design",
    value: 9800,
    tax: 1764,
    discount: 0,
    status: "awaiting",
  },
  {
    id: "JR-1039",
    client: "Pied Piper",
    service: "Promo Video Edit",
    value: 7200,
    tax: 1296,
    discount: 200,
    status: "awaiting",
  },
  {
    id: "JR-1031",
    client: "Aviato",
    service: "Whitepaper Draft",
    value: 6000,
    tax: 1080,
    discount: 0,
    status: "paid",
  },
  {
    id: "JR-1028",
    client: "Vandelay",
    service: "Pitch Deck",
    value: 8400,
    tax: 1512,
    discount: 400,
    status: "paid",
  },
];

const OVERRIDES_KEY = "jobrio.admin.bills.overrides";
const ADDED_KEY = "jobrio.admin.bills.added";

const loadOverrides = (): Record<string, Partial<BillRow>> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Partial<BillRow>>) : {};
  } catch {
    return {};
  }
};

const persistOverrides = (overrides: Record<string, Partial<BillRow>>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
};

const loadAdded = (): BillRow[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(ADDED_KEY) || "[]") as BillRow[];
  } catch {
    return [];
  }
};
let added: BillRow[] = loadAdded();
let overrides: Record<string, Partial<BillRow>> = loadOverrides();
let snapshot: BillRow[] = [];
const listeners = new Set<() => void>();

const rebuildSnapshot = () => {
  snapshot = [...added, ...SEED].map((row) =>
    overrides[row.id] ? { ...row, ...overrides[row.id] } : row,
  );
};
rebuildSnapshot();

const notify = () => listeners.forEach((l) => l());

export const getBillRegistrySnapshot = (): BillRow[] => snapshot;

export const subscribeBillRegistry = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Generates an invoice for an existing Pending Billing row: moves it to
 *  Awaiting Payment, stamps invoice details, notifies the client, and — if
 *  this id also exists as a live order — keeps that order's status in sync
 *  too. `overrides` lets the admin adjust value/tax/discount from the Bill
 *  Creation screen before the invoice is generated. */

export const upsertBillForOrder = (row: BillRow) => {
  added = [row, ...added.filter((b) => b.id !== row.id)];
  if (typeof window !== "undefined") window.localStorage.setItem(ADDED_KEY, JSON.stringify(added));
  rebuildSnapshot();
  notify();
  return row;
};

export const generateInvoiceForBill = (
  id: string,
  overrides_?: { value?: number; tax?: number; discount?: number },
): BillRow | undefined => {
  const bill = snapshot.find((b) => b.id === id);
  if (!bill) return undefined;
  const value = overrides_?.value ?? bill.value;
  const tax = overrides_?.tax ?? bill.tax;
  const discount = overrides_?.discount ?? bill.discount;
  const finalBill = Math.max(0, value + tax - discount);
  const now = new Date();
  const invoiceNo = `INV-${id.replace(/[^0-9A-Za-z]/g, "")}`;
  const invoiceDate = now.toISOString().slice(0, 10);
  const paymentDue = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  overrides = {
    ...overrides,
    [id]: {
      ...overrides[id],
      value,
      tax,
      discount,
      status: "awaiting",
      invoiceNo,
      invoiceDate,
      paymentDue,
    },
  };
  persistOverrides(overrides);
  rebuildSnapshot();
  notify();

  addNotification({
    type: "invoice",
    title: `Invoice ${invoiceNo} sent for Order #${id}`,
    body: `Your bill of ₹${finalBill.toLocaleString()} is ready — please complete payment by ${paymentDue}.`,
    orderId: id,
  });

  // Keep the Order Desk in sync when this bill corresponds to a real order.
  if (getOrderRegistrySnapshot().some((o) => o.id === id)) {
    updateOrderInRegistry(id, {
      s: "awaiting_payment",
      a: `₹${finalBill.toLocaleString()}`,
      amountNum: finalBill,
      invoiceNo,
      invoiceDate,
      paymentDue,
    });
  }

  return snapshot.find((b) => b.id === id);
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== OVERRIDES_KEY && e.key !== ADDED_KEY) return;
    added = loadAdded();
    overrides = loadOverrides();
    rebuildSnapshot();
    notify();
  });
}

export const useBillRegistry = (): BillRow[] =>
  useSyncExternalStore(subscribeBillRegistry, getBillRegistrySnapshot, getBillRegistrySnapshot);
