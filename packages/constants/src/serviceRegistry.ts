import { useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";
import { Package } from "lucide-react";
import { allServices, SD_SERVICES, classifyService, type SDCategory } from "./services";

/**
 * Cross-app service registry.
 *
 * Single mutable source of truth for every service in the platform:
 *  - Super Admin → Services Desk (create / list / view)
 *  - Landing page → Services page (flat catalog, no category — unchanged UI)
 *  - Client Dashboard → Order Create (grouped by category)
 *
 * Seeded from the existing `allServices` / `SD_SERVICES` catalog (unchanged),
 * then extended with any service created from the Services Desk. New
 * services are persisted to localStorage (same-origin across /admin and the
 * platform app) so they survive reloads and cross-tab navigation, and every
 * subscriber (React components in either app) re-renders automatically when
 * the registry changes.
 */

export interface RegisteredService {
  id: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  category: SDCategory;
  subcategory: string;
  status: "Active" | "Inactive";
  visibility: "Public" | "Hidden";
  activeOrders: number;
  demand: "Growing" | "Stable" | "Declining";
  shortDesc: string;
  fullDesc: string;
  /** "seed" = shipped with the catalog, "custom" = created via Services Desk. */
  source: "seed" | "custom";
}

export interface CreateServiceInput {
  name: string;
  category: SDCategory;
  subcategory: string;
  shortDesc: string;
  fullDesc: string;
  status: "Active" | "Inactive";
  visibility: "Public" | "Hidden";
}

const STORAGE_KEY = "jobrio.services.custom";

const SEED: RegisteredService[] = allServices.map((service, i) => {
  const sd = SD_SERVICES[i];
  return {
    id: sd.id,
    icon: service.icon,
    title: service.title,
    desc: service.desc,
    category: sd.category,
    subcategory: sd.subcategory,
    status: sd.status,
    visibility: sd.visibility,
    activeOrders: sd.activeOrders,
    demand: sd.demand,
    shortDesc: sd.shortDesc,
    fullDesc: sd.fullDesc,
    source: "seed",
  };
});

const shorten = (desc: string) => {
  const firstClause = desc.split(/[,.]/)[0].trim();
  return firstClause.length > 58 ? `${firstClause.slice(0, 55).trim()}…` : `${firstClause}.`;
};

const loadCustom = (): RegisteredService[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Omit<RegisteredService, "icon">[];
    return parsed.map((s) => ({ ...s, icon: Package }));
  } catch {
    return [];
  }
};

const persistCustom = (services: RegisteredService[]) => {
  if (typeof window === "undefined") return;
  const serializable = services.map(({ icon: _icon, ...rest }) => rest);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
};

let custom: RegisteredService[] = loadCustom();
let snapshot: RegisteredService[] = [...SEED, ...custom];
const listeners = new Set<() => void>();

const rebuildSnapshot = () => {
  snapshot = [...SEED, ...custom];
};

const notify = () => {
  listeners.forEach((l) => l());
};

/** Current full list of services (seed catalog + admin-created services). */
export const getServiceRegistrySnapshot = (): RegisteredService[] => snapshot;

export const subscribeServiceRegistry = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Called from the Services Desk "Create New Service" action. */
export const addServiceToRegistry = (input: CreateServiceInput): RegisteredService => {
  const created: RegisteredService = {
    id: `SRV-${2000 + custom.length}`,
    icon: Package,
    title: input.name,
    desc: input.fullDesc || input.shortDesc || input.name,
    category: input.category,
    subcategory: input.subcategory || classifyService(input.name, input.fullDesc).subcategory,
    status: input.status,
    visibility: input.visibility,
    activeOrders: 0,
    demand: "Stable",
    shortDesc: input.shortDesc || shorten(input.fullDesc || input.name),
    fullDesc: input.fullDesc || input.shortDesc || input.name,
    source: "custom",
  };
  custom = [...custom, created];
  persistCustom(custom);
  rebuildSnapshot();
  notify();
  return created;
};

// Keep multiple tabs / apps on the same origin (e.g. `/` and `/admin`) in
// sync: when another tab writes to localStorage, reload custom services here.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    custom = loadCustom();
    rebuildSnapshot();
    notify();
  });
}

/** React hook: live-updating list of all services, re-renders on any change. */
export const useServiceRegistry = (): RegisteredService[] =>
  useSyncExternalStore(
    subscribeServiceRegistry,
    getServiceRegistrySnapshot,
    getServiceRegistrySnapshot,
  );
