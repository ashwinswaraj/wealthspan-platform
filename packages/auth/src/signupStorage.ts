export type Role = "client" | "professional";

const key = (role: Role) => `jobrio_signup_${role}`;

export const loadSignup = <T = Record<string, unknown>>(role: Role): T => {
  if (typeof window === "undefined") return {} as T;
  try {
    const raw = sessionStorage.getItem(key(role));
    return raw ? (JSON.parse(raw) as T) : ({} as T);
  } catch {
    return {} as T;
  }
};

export const saveSignup = (role: Role, patch: Record<string, unknown>) => {
  if (typeof window === "undefined") return;
  const current = loadSignup(role);
  const merged = { ...current, ...patch };
  sessionStorage.setItem(key(role), JSON.stringify(merged));
};

export const clearSignup = (role: Role) => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(key(role));
};
