import { useSyncExternalStore } from "react";

export type AuditEvent = {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  from?: string;
  to?: string;
  actor: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};
const KEY = "jobrio.audit.events";
const listeners = new Set<() => void>();
const load = (): AuditEvent[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]") as AuditEvent[];
  } catch {
    return [];
  }
};
let rows = load();
const persist = () => {
  if (typeof window !== "undefined")
    window.localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 1000)));
};
const notify = () => listeners.forEach((l) => l());
export const getAuditSnapshot = () => rows;
export const subscribeAudit = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const recordAuditEvent = (event: Omit<AuditEvent, "id" | "createdAt">) => {
  const item = {
    ...event,
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  rows = [item, ...rows].slice(0, 1000);
  persist();
  notify();
  return item;
};
if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      rows = load();
      notify();
    }
  });
export const useAuditRegistry = () =>
  useSyncExternalStore(subscribeAudit, getAuditSnapshot, getAuditSnapshot);
