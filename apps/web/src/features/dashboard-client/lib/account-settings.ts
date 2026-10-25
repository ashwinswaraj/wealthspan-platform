import type { Role } from "@jobrio/auth/signupStorage";

export type PaymentMethod = {
  id: string;
  type: "card" | "upi" | "netbanking";
  label: string;
  primary: boolean;
};

export type Session = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
};

export type AccountSettings = {
  language: string;
  timezone: string;
  appearance: "system" | "light" | "dark";
  density: "comfortable" | "compact";
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  security: {
    twoFactor: boolean;
    twoFactorMethod: "app" | "sms" | "email";
    passwordUpdatedAt: string | null;
    loginAlerts: boolean;
  };
  sessions: Session[];
  privacy: {
    profileVisibility: "public" | "contacts" | "private";
    showActivity: boolean;
    allowSearch: boolean;
  };
  paymentMethods: PaymentMethod[];
  billing: {
    legalName: string;
    gstin: string;
    address: string;
    city: string;
    pincode: string;
  };
  wallet: {
    autoTopUp: boolean;
    threshold: number;
    topUpAmount: number;
  };
  orderDefaults: {
    budget: number;
    sla: "24h" | "48h" | "3d" | "7d";
    category: string;
    autoAssign: boolean;
  };
  payout: {
    method: "bank" | "upi";
    accountName: string;
    accountNumber: string;
    ifsc: string;
    upiId: string;
    schedule: "weekly" | "biweekly" | "monthly";
  };
  availability: {
    type: "full-time" | "part-time" | "weekends";
    hoursPerWeek: number;
    maxActiveJobs: number;
    acceptUrgent: boolean;
  };
  skills: string[];
  serviceRadiusKm: number;
};

export const DEFAULT_SETTINGS: AccountSettings = {
  language: "English (IN)",
  timezone: "Asia/Kolkata",
  appearance: "system",
  density: "comfortable",
  notifications: { email: true, sms: false, push: true, marketing: false },
  security: {
    twoFactor: false,
    twoFactorMethod: "app",
    passwordUpdatedAt: null,
    loginAlerts: true,
  },
  sessions: [
    {
      id: "s1",
      device: "This device",
      location: "Bengaluru, IN",
      lastActive: "Now",
      current: true,
    },
    {
      id: "s2",
      device: "Chrome · Windows",
      location: "Mumbai, IN",
      lastActive: "2 days ago",
      current: false,
    },
  ],
  privacy: { profileVisibility: "contacts", showActivity: true, allowSearch: true },
  paymentMethods: [],
  billing: { legalName: "", gstin: "", address: "", city: "", pincode: "" },
  wallet: { autoTopUp: false, threshold: 500, topUpAmount: 2000 },
  orderDefaults: { budget: 5000, sla: "48h", category: "", autoAssign: false },
  payout: {
    method: "bank",
    accountName: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
    schedule: "weekly",
  },
  availability: {
    type: "full-time",
    hoursPerWeek: 40,
    maxActiveJobs: 3,
    acceptUrgent: true,
  },
  skills: [],
  serviceRadiusKm: 15,
};

const storageKey = (role: Role) => `jobrio_settings_${role}`;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const merge = <T>(base: T, patch: unknown): T => {
  if (!isPlainObject(patch) || !isPlainObject(base)) return (patch === undefined ? base : patch) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    out[k] = k in base ? merge((base as Record<string, unknown>)[k], v) : v;
  }
  return out as T;
};

export const loadSettings = (role: Role): AccountSettings => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(storageKey(role));
    return raw ? merge(DEFAULT_SETTINGS, JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (role: Role, settings: AccountSettings) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(role), JSON.stringify(settings));
  } catch {
    /* storage unavailable */
  }
};

export const getPath = (obj: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, k) => (isPlainObject(acc) ? acc[k] : undefined), obj);

export const setPath = <T>(obj: T, path: string, value: unknown): T => {
  const [head, ...rest] = path.split(".");
  const source = isPlainObject(obj) ? obj : ({} as Record<string, unknown>);
  const next: Record<string, unknown> = { ...source };
  next[head] = rest.length ? setPath(source[head], rest.join("."), value) : value;
  return next as T;
};

export const exportAccountData = (role: Role, extra: Record<string, unknown>) => {
  const payload = {
    exportedAt: new Date().toISOString(),
    role,
    signup: extra,
    settings: loadSettings(role),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `jobrio-${role}-data.json`;
  a.click();
  URL.revokeObjectURL(url);
};
