import { useSyncExternalStore } from "react";
import { DEMO_NOTIFS, type NotifItem, type NotifType } from "./notifications";

/**
 * Cross-app notification registry.
 *
 * Single mutable source of truth for the client's Notifications feed —
 * pushed to from the Super Admin app whenever an order decision needs to
 * reach the client: Reject Order (with reason), Request More Info, and
 * "Bill sent" once an invoice is generated in Finance & Escrow.
 *
 * Same pattern as the service/order registries: seeded from the existing
 * demo feed, persisted to localStorage (same-origin across `/admin` and the
 * platform app), reactive via subscribe/notify + `storage` events for
 * cross-tab sync.
 */

const ADDED_KEY = "jobrio.notifications.added";
const READ_KEY = "jobrio.notifications.read-overrides";

const loadAdded = (): NotifItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ADDED_KEY);
    return raw ? (JSON.parse(raw) as NotifItem[]) : [];
  } catch {
    return [];
  }
};

const loadReadOverrides = (): Record<string, boolean> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
};

const persistAdded = (items: NotifItem[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADDED_KEY, JSON.stringify(items));
};

const persistReadOverrides = (overrides: Record<string, boolean>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(READ_KEY, JSON.stringify(overrides));
};

let added: NotifItem[] = loadAdded();
let readOverrides: Record<string, boolean> = loadReadOverrides();
let snapshot: NotifItem[] = [];
const listeners = new Set<() => void>();

const applyRead = (item: NotifItem): NotifItem =>
  item.id in readOverrides ? { ...item, read: readOverrides[item.id] } : item;

const rebuildSnapshot = () => {
  snapshot = [...added, ...DEMO_NOTIFS].map(applyRead);
};
rebuildSnapshot();

const notify = () => listeners.forEach((l) => l());

export const getNotificationRegistrySnapshot = (): NotifItem[] => snapshot;

export const subscribeNotificationRegistry = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export interface AddNotificationInput {
  type: NotifType;
  title: string;
  body: string;
  clientId?: string;
  orderId?: string;
}

/** Push a new notification into the client's feed — called from the Super
 *  Admin app on Reject Order, Request More Info, and Generate & Send
 *  Invoice. */
export const addNotification = (input: AddNotificationInput): NotifItem => {
  const item: NotifItem = {
    id: `N-${Date.now()}-${Math.round(Math.random() * 999)}`,
    type: input.type,
    title: input.title,
    body: input.body,
    time: "Just now",
    read: false,
    clientId: input.clientId,
    orderId: input.orderId,
  };
  added = [item, ...added];
  persistAdded(added);
  rebuildSnapshot();
  notify();
  return item;
};

export const markNotificationRead = (id: string, read = true) => {
  readOverrides = { ...readOverrides, [id]: read };
  persistReadOverrides(readOverrides);
  rebuildSnapshot();
  notify();
};

export const markAllNotificationsRead = () => {
  const next = { ...readOverrides };
  for (const item of snapshot) next[item.id] = true;
  readOverrides = next;
  persistReadOverrides(readOverrides);
  rebuildSnapshot();
  notify();
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== ADDED_KEY && e.key !== READ_KEY) return;
    added = loadAdded();
    readOverrides = loadReadOverrides();
    rebuildSnapshot();
    notify();
  });
}

/** React hook: live-updating notification feed, re-renders on any change. */
export const useNotificationRegistry = (): NotifItem[] =>
  useSyncExternalStore(
    subscribeNotificationRegistry,
    getNotificationRegistrySnapshot,
    getNotificationRegistrySnapshot,
  );
