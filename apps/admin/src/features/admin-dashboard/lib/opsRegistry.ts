import { useSyncExternalStore } from "react";
import {
  updateOrderInRegistry,
  addNotification,
  getOrderRegistrySnapshot,
  recordAuditEvent,
  findPaymentByOrder,
  updatePayment,
} from "@jobrio/constants";

/**
 * Finance Ops registries (admin-only): Escrow Center, Payout Center, Refund
 * Center. Same reactive-registry pattern as billRegistry.ts — persisted
 * overrides on top of a seed, every subscriber re-renders on change.
 *
 * These three are wired together to model a real settlement pipeline:
 *   Escrow "Release to Payout"  → order → "released"; creates a new
 *                                  Pending payout for the professional.
 *   Payout "Process Payout"     → payout → "completed" (settles the payout
 *                                  created above, or any seeded payout).
 *   Refund "Approve" → "Process"→ order → "cancelled" (refunded); client
 *                                  is notified once the refund is completed.
 */

/* ---------------- Escrow ---------------- */

export type EscrowTab = "active" | "release_pending" | "released" | "frozen";
export type EscrowState =
  "Awaiting Deposit" | "Funded" | "Locked" | "Release Pending" | "Released" | "Frozen";
export type EscrowRow = {
  id: string;
  orderId: string;
  client: string;
  professional?: string;
  amount: number;
  state: EscrowState;
  depositDate: string;
  releaseEligibility: string;
  releaseDate?: string;
  tab: EscrowTab;
};

const ESCROW_SEED: EscrowRow[] = [
  {
    id: "ESC-2041",
    orderId: "JR-1041",
    client: "Hooli",
    professional: "K. Iyer",
    amount: 11564,
    state: "Locked",
    depositDate: "12 Jun",
    releaseEligibility: "On client approval",
    tab: "active",
  },
  {
    id: "ESC-2039",
    orderId: "JR-1039",
    client: "Pied Piper",
    professional: "A. Bose",
    amount: 8296,
    state: "Funded",
    depositDate: "13 Jun",
    releaseEligibility: "On client approval",
    tab: "active",
  },
  {
    id: "ESC-2031",
    orderId: "JR-1031",
    client: "Aviato",
    professional: "R. Sharma",
    amount: 7080,
    state: "Release Pending",
    depositDate: "10 Jun",
    releaseEligibility: "Approved · awaiting payout",
    tab: "release_pending",
  },
  {
    id: "ESC-2028",
    orderId: "JR-1028",
    client: "Vandelay",
    professional: "M. Kumar",
    amount: 9512,
    state: "Released",
    depositDate: "06 Jun",
    releaseEligibility: "Released",
    releaseDate: "14 Jun",
    tab: "released",
  },
  {
    id: "ESC-2024",
    orderId: "JR-1024",
    client: "Initech",
    professional: "N. Patel",
    amount: 5400,
    state: "Frozen",
    depositDate: "04 Jun",
    releaseEligibility: "Dispute hold",
    tab: "frozen",
  },
];

/* ---------------- Payout ---------------- */

export type PayoutTab = "pending" | "processing" | "completed" | "failed";
export type PayoutRow = {
  id: string;
  professional: string;
  orderId: string;
  gross: number;
  fee: number;
  releaseDate: string;
  status: PayoutTab;
  txRef?: string;
  escrowId: string;
};

const PAYOUT_SEED: PayoutRow[] = [
  {
    id: "PO-3081",
    professional: "K. Iyer",
    orderId: "JR-1031",
    gross: 7080,
    fee: 1062,
    releaseDate: "15 Jun",
    status: "pending",
    escrowId: "ESC-2031",
  },
  {
    id: "PO-3079",
    professional: "A. Bose",
    orderId: "JR-1029",
    gross: 5400,
    fee: 810,
    releaseDate: "15 Jun",
    status: "pending",
    escrowId: "ESC-2029",
  },
  {
    id: "PO-3072",
    professional: "R. Sharma",
    orderId: "JR-1024",
    gross: 6200,
    fee: 930,
    releaseDate: "14 Jun",
    status: "processing",
    txRef: "TX-99812",
    escrowId: "ESC-2024",
  },
  {
    id: "PO-3061",
    professional: "M. Kumar",
    orderId: "JR-1019",
    gross: 9512,
    fee: 1426,
    releaseDate: "13 Jun",
    status: "completed",
    txRef: "TX-99780",
    escrowId: "ESC-2019",
  },
  {
    id: "PO-3055",
    professional: "N. Patel",
    orderId: "JR-1014",
    gross: 4800,
    fee: 720,
    releaseDate: "12 Jun",
    status: "failed",
    txRef: "TX-99765",
    escrowId: "ESC-2014",
  },
];

/* ---------------- Refund ---------------- */

export type RefundTab = "requests" | "review" | "approved" | "completed" | "rejected";
export type RefundSource =
  "Order Cancellation" | "Dispute Decision" | "Assignment Failure" | "System Exception";
export type RefundRow = {
  id: string;
  orderId: string;
  client: string;
  amount: number;
  reason: string;
  source: RefundSource;
  status: RefundTab;
  rejectionReason?: string;
};

const REFUND_SEED: RefundRow[] = [
  {
    id: "RF-901",
    orderId: "JR-1051",
    client: "Initech",
    amount: 4800,
    reason: "Client cancelled before assignment",
    source: "Order Cancellation",
    status: "requests",
  },
  {
    id: "RF-902",
    orderId: "JR-1048",
    client: "Globex",
    amount: 6200,
    reason: "Deliverable quality dispute",
    source: "Dispute Decision",
    status: "review",
  },
  {
    id: "RF-903",
    orderId: "JR-1041",
    client: "Hooli",
    amount: 3200,
    reason: "No professional accepted in SLA",
    source: "Assignment Failure",
    status: "approved",
  },
  {
    id: "RF-904",
    orderId: "JR-1039",
    client: "Pied Piper",
    amount: 1500,
    reason: "Duplicate charge",
    source: "System Exception",
    status: "completed",
  },
  {
    id: "RF-905",
    orderId: "JR-1024",
    client: "Aviato",
    amount: 0,
    reason: "Client request — invalid",
    source: "Order Cancellation",
    status: "rejected",
  },
];

/* ---------------- Generic persisted-overlay registry helper ---------------- */

function createRegistry<T extends { id: string }>(key: string, seed: T[]) {
  const load = (): Record<string, Partial<T>> => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Record<string, Partial<T>>) : {};
    } catch {
      return {};
    }
  };
  const persist = (o: Record<string, Partial<T>>) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(o));
  };

  let overrides = load();
  const ADDED_KEY = `${key}.added`;
  const loadAdded = (): T[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(ADDED_KEY) || "[]") as T[];
    } catch {
      return [];
    }
  };
  let added: T[] = loadAdded();
  let snapshot: T[] = [];
  const listeners = new Set<() => void>();

  const rebuild = () => {
    snapshot = [...added, ...seed].map((row) =>
      overrides[row.id] ? { ...row, ...overrides[row.id] } : row,
    );
  };
  rebuild();

  const notify = () => listeners.forEach((l) => l());

  if (typeof window !== "undefined") {
    const refresh = () => {
      overrides = load();
      added = loadAdded();
      rebuild();
      notify();
    };
    window.addEventListener("storage", (e) => {
      if (e.key !== key && e.key !== ADDED_KEY) return;
      refresh();
    });
    window.addEventListener("jobrio:finance-changed", refresh as EventListener);
  }

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    update: (id: string, patch: Partial<T>) => {
      overrides = { ...overrides, [id]: { ...overrides[id], ...patch } };
      persist(overrides);
      rebuild();
      notify();
      return snapshot.find((r) => r.id === id);
    },
    add: (row: T) => {
      added = [row, ...added.filter((x) => x.id !== row.id)];
      if (typeof window !== "undefined")
        window.localStorage.setItem(ADDED_KEY, JSON.stringify(added));
      rebuild();
      recordAuditEvent({
        entity: "finance",
        entityId: row.id,
        action: "created",
        actor: "admin",
        metadata: row as unknown as Record<string, unknown>,
      });
      notify();
      return row;
    },
    find: (id: string) => snapshot.find((r) => r.id === id),
  };
}

const escrowStore = createRegistry<EscrowRow>("jobrio.admin.escrow.overrides", ESCROW_SEED);
const payoutStore = createRegistry<PayoutRow>("jobrio.admin.payout.overrides", PAYOUT_SEED);
const refundStore = createRegistry<RefundRow>("jobrio.admin.refund.overrides", REFUND_SEED);

export const useEscrowRegistry = (): EscrowRow[] =>
  useSyncExternalStore(escrowStore.subscribe, escrowStore.getSnapshot, escrowStore.getSnapshot);
export const usePayoutRegistry = (): PayoutRow[] =>
  useSyncExternalStore(payoutStore.subscribe, payoutStore.getSnapshot, payoutStore.getSnapshot);
export const useRefundRegistry = (): RefundRow[] =>
  useSyncExternalStore(refundStore.subscribe, refundStore.getSnapshot, refundStore.getSnapshot);

/** Escrow "Release to Payout": moves escrow to Released, flips the matching
 *  order (if any) to "released", and creates a fresh Pending payout for the
 *  professional — the real next step in the settlement pipeline. */
export const releaseEscrowToPayout = (id: string) => {
  const row = escrowStore.find(id);
  if (!row) return;
  const releaseDate = new Date().toISOString().slice(0, 10);
  escrowStore.update(id, {
    state: "Released",
    tab: "released",
    releaseEligibility: "Released",
    releaseDate,
  } as Partial<EscrowRow>);
  recordAuditEvent({
    entity: "escrow",
    entityId: id,
    action: "release_to_payout",
    from: row.state,
    to: "Released",
    actor: "admin",
    metadata: { orderId: row.orderId, amount: row.amount },
  });

  if (getOrderRegistrySnapshot().some((o) => o.id === row.orderId)) {
    updateOrderInRegistry(row.orderId, { s: "released" });
  }

  const fee = Math.round(row.amount * 0.15);
  payoutStore.add({
    id: `PO-${Math.floor(3000 + Math.random() * 999)}`,
    professional: row.professional ?? "Unassigned",
    orderId: row.orderId,
    gross: row.amount,
    fee,
    releaseDate,
    status: "pending",
    escrowId: row.id,
  });
};

/** Payout "Process Payout" / "Retry Payout": settles the payout and, when
 *  the order still exists, stamps the payout + platform fee onto it. */
export const settlePayout = (id: string) => {
  const row = payoutStore.find(id);
  if (!row) return;
  const txRef = `TX-${Math.floor(90000 + Math.random() * 9999)}`;
  payoutStore.update(id, { status: "completed", txRef } as Partial<PayoutRow>);
  recordAuditEvent({
    entity: "payout",
    entityId: id,
    action: "settled",
    from: row.status,
    to: "completed",
    actor: "admin",
    metadata: { orderId: row.orderId, txRef },
  });

  if (getOrderRegistrySnapshot().some((o) => o.id === row.orderId)) {
    updateOrderInRegistry(row.orderId, {
      payoutAmount: `₹${(row.gross - row.fee).toLocaleString()}`,
      platformFee: `₹${row.fee.toLocaleString()}`,
    });
  }
};

export const holdPayout = (id: string) => {
  const row = payoutStore.find(id);
  const result = payoutStore.update(id, { status: "processing" } as Partial<PayoutRow>);
  if (row)
    recordAuditEvent({
      entity: "payout",
      entityId: id,
      action: "processing",
      from: row.status,
      to: "processing",
      actor: "admin",
    });
  return result;
};

/** Refund "Approve Refund" → requests/review moves to Approved. */
export const approveRefund = (id: string) => {
  const row = refundStore.find(id);
  const result = refundStore.update(id, { status: "approved" } as Partial<RefundRow>);
  if (row)
    recordAuditEvent({
      entity: "refund",
      entityId: id,
      action: "approved",
      from: row.status,
      to: "approved",
      actor: "admin",
      metadata: { orderId: row.orderId, amount: row.amount },
    });
  return result;
};

/** Refund "Reject Refund" → requires a reason, notifies the client. */
export const requestRefund = (orderId: string, reason: string, source: RefundSource) => {
  const id = `RF-${Math.floor(1000 + Math.random() * 9000)}`;
  return refundStore.add({
    id,
    orderId,
    client: "Unknown Client",
    amount: 0,
    reason,
    source,
    status: "requests",
  });
};

export const rejectRefund = (id: string, reason: string) => {
  const row = refundStore.find(id);
  if (!row) return;
  refundStore.update(id, { status: "rejected", rejectionReason: reason } as Partial<RefundRow>);
  recordAuditEvent({
    entity: "refund",
    entityId: id,
    action: "rejected",
    from: row.status,
    to: "rejected",
    actor: "admin",
    metadata: { orderId: row.orderId, reason },
  });
  addNotification({
    type: "order",
    title: `Refund request for Order #${row.orderId} was declined`,
    body: reason,
    orderId: row.orderId,
  });
};

/** Refund "Process Refund" → Completed; flips the matching order to
 *  "cancelled" (Cancelled & Refunded) and notifies the client. */
export const processRefund = (id: string) => {
  const row = refundStore.find(id);
  if (!row) return;
  refundStore.update(id, { status: "completed" } as Partial<RefundRow>);
  recordAuditEvent({
    entity: "refund",
    entityId: id,
    action: "processed",
    from: row.status,
    to: "completed",
    actor: "admin",
    metadata: { orderId: row.orderId, amount: row.amount },
  });

  if (getOrderRegistrySnapshot().some((o) => o.id === row.orderId)) {
    const payment = findPaymentByOrder(row.orderId);
    if (payment) updatePayment(payment.id, { status: "refunded" });
    updateOrderInRegistry(row.orderId, {
      s: "cancelled",
      refundAmount: `₹${row.amount.toLocaleString()}`,
    });
  }
  addNotification({
    type: "invoice",
    title: `Refund processed for Order #${row.orderId}`,
    body: `₹${row.amount.toLocaleString()} has been refunded to your original payment method.`,
    orderId: row.orderId,
  });
};

export const escrowStateTone = (s: EscrowState) =>
  s === "Released"
    ? "bg-emerald-50 text-emerald-700"
    : s === "Frozen"
      ? "bg-rose-50 text-rose-700"
      : s === "Release Pending"
        ? "bg-amber-50 text-amber-700"
        : s === "Locked"
          ? "bg-violet-50 text-violet-700"
          : s === "Funded"
            ? "bg-primary-container/10 text-primary-container"
            : "bg-slate-100 text-slate-700";

export const payoutTone = (s: PayoutTab) =>
  s === "completed"
    ? "bg-emerald-50 text-emerald-700"
    : s === "failed"
      ? "bg-rose-50 text-rose-700"
      : s === "processing"
        ? "bg-primary-container/10 text-primary-container"
        : "bg-amber-50 text-amber-700";
export const payoutLabel = (s: PayoutTab) =>
  s === "pending"
    ? "Pending"
    : s === "processing"
      ? "Processing"
      : s === "completed"
        ? "Completed"
        : "Failed";

export const refundTone = (s: RefundTab) =>
  s === "completed"
    ? "bg-emerald-50 text-emerald-700"
    : s === "rejected"
      ? "bg-rose-50 text-rose-700"
      : s === "approved"
        ? "bg-primary-container/10 text-primary-container"
        : s === "review"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-700";
export const refundLabel = (s: RefundTab) =>
  s === "requests"
    ? "Refund Request"
    : s === "review"
      ? "Under Review"
      : s === "approved"
        ? "Approved"
        : s === "completed"
          ? "Completed"
          : "Rejected";
