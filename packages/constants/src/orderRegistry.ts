import { useSyncExternalStore } from "react";
import { ORDERS, type OrderRow } from "./orders";
import { recordAuditEvent } from "./auditRegistry";
import { onPaymentReceived } from "./workflow";
import { ORDER_TRANSITIONS } from "./actions/orderLifecycle";
import { assertTransition } from "./actions/resolver";

/**
 * Cross-app order registry.
 *
 * Single mutable source of truth for every order in the platform:
 *  - Client Dashboard → Order Create (submits new orders)
 *  - Super Admin → Order Desk (reads every order, starting at "Pending
 *    Review", and drives the rest of the order lifecycle — Approve /
 *    Reject / Request Info / Finance & Escrow / etc. — from there)
 *
 * Seeded from the existing `ORDERS` mock (unchanged). Two localStorage
 * layers sit on top of the seed, same-origin across `/admin` and the
 * platform app:
 *  - "added" — brand new orders a client has submitted.
 *  - "overrides" — per-id patches applied to ANY order (seed or added),
 *    e.g. a status change from Approve/Reject/Request Info/Generate Invoice.
 * Every subscriber (React components in either app) re-renders
 * automatically when either layer changes.
 */

const ADDED_KEY = "jobrio.orders.custom";
const OVERRIDES_KEY = "jobrio.orders.overrides";

const loadAdded = (): OrderRow[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ADDED_KEY);
    return raw ? (JSON.parse(raw) as OrderRow[]) : [];
  } catch {
    return [];
  }
};

const loadOverrides = (): Record<string, Partial<OrderRow>> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Partial<OrderRow>>) : {};
  } catch {
    return {};
  }
};

const persistAdded = (orders: OrderRow[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADDED_KEY, JSON.stringify(orders));
};

const persistOverrides = (overrides: Record<string, Partial<OrderRow>>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
};

let added: OrderRow[] = loadAdded();
let overrides: Record<string, Partial<OrderRow>> = loadOverrides();
let snapshot: OrderRow[] = [];
const listeners = new Set<() => void>();

const applyOverrides = (order: OrderRow): OrderRow =>
  overrides[order.id] ? { ...order, ...overrides[order.id] } : order;

const rebuildSnapshot = () => {
  // Newest client-submitted orders first, then the seed history — matches
  // the Order Desk's "most recent first" expectation. Overrides (status
  // changes etc.) are applied on top of both.
  snapshot = [...added, ...ORDERS].map(applyOverrides);
};
rebuildSnapshot();

const notify = () => {
  listeners.forEach((l) => l());
};

/** Current full list of orders (seed history + client-submitted orders, with
 *  any admin-applied status changes). */
export const getOrderRegistrySnapshot = (): OrderRow[] => snapshot;

export const subscribeOrderRegistry = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Called when a client submits an order from Order Create. Always lands as
 *  "pending" (Pending Review) in the Order Desk, exactly like every other
 *  new order. */
export const addOrderToRegistry = (order: OrderRow): OrderRow => {
  added = [order, ...added];
  persistAdded(added);
  rebuildSnapshot();
  notify();
  return order;
};

/** Patch any order (seed or client-submitted) by id — used for every
 *  status transition driven from the Order Desk / Finance & Escrow:
 *  Approve, Reject, Request More Info, Generate & Send Invoice, etc.
 *  Reflected everywhere the registry is read, immediately. */
export const updateOrderInRegistry = (
  id: string,
  patch: Partial<OrderRow>,
): OrderRow | undefined => {
  const before = snapshot.find((o) => o.id === id);

  // Mutation layer is the final authority on lifecycle transitions: a stale
  // or hand-crafted request for an invalid transition is rejected here and
  // recorded, no matter which surface asked for it.
  if (before && patch.s && patch.s !== before.s) {
    const decision = assertTransition({
      from: before.s,
      to: patch.s,
      transitions: ORDER_TRANSITIONS,
      resource: "order",
    });
    if (!decision.allowed) {
      recordAuditEvent({
        entity: "order",
        entityId: id,
        action: "transition_rejected",
        from: before.s,
        to: patch.s,
        actor: "system",
        metadata: { reason: decision.reason },
      });
      return before;
    }
  }

  overrides = { ...overrides, [id]: { ...overrides[id], ...patch } };
  persistOverrides(overrides);
  rebuildSnapshot();
  let after = snapshot.find((o) => o.id === id);
  if (after) {
    recordAuditEvent({
      entity: "order",
      entityId: id,
      action: patch.s ? "status_transition" : "order_updated",
      from: before?.s,
      to: after.s,
      actor: "system",
      metadata: patch as Record<string, unknown>,
    });
    if (patch.s === "payment_received" && after.s === "payment_received") {
      const workflowPatch = onPaymentReceived(after);
      if (Object.keys(workflowPatch).length) {
        overrides = { ...overrides, [id]: { ...overrides[id], ...workflowPatch } };
        persistOverrides(overrides);
        rebuildSnapshot();
        after = snapshot.find((o) => o.id === id);
        if (after?.s === "assigned") {
          recordAuditEvent({
            entity: "order",
            entityId: id,
            action: "assignment_triggered",
            from: "payment_received",
            to: "assigned",
            actor: "system",
            metadata: workflowPatch as Record<string, unknown>,
          });
        }
      }
    }
  }
  notify();
  return after;
};

// Keep multiple tabs / apps on the same origin (e.g. `/` and `/admin`) in
// sync: when another tab writes to localStorage, reload from it here.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== ADDED_KEY && e.key !== OVERRIDES_KEY) return;
    added = loadAdded();
    overrides = loadOverrides();
    rebuildSnapshot();
    notify();
  });
}

/** React hook: live-updating list of all orders, re-renders on any change. */
export const useOrderRegistry = (): OrderRow[] =>
  useSyncExternalStore(subscribeOrderRegistry, getOrderRegistrySnapshot, getOrderRegistrySnapshot);
