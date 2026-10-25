/* ------------------------------------------------------------------
 * Permission model.
 *
 * Mirrors the module names already used by Access Control
 * (`admin-dashboard/components/sections/roles.tsx` PERMISSION_OPTIONS)
 * and the `super` / `sub` distinction read from Supabase
 * `app_metadata.role` (see docs/Security/RBAC.md).
 *
 * Permission answers "may this actor ever do this?" — never "is this
 * valid for the resource's current state?". Both are required; see
 * `resolver.ts`.
 * ------------------------------------------------------------------ */

export const PERMISSIONS = [
  "users.read",
  "users.suspend",
  "users.block",
  "users.reactivate",
  "users.delete",
  "users.reset_password",
  "users.change_role",
  "orders.read",
  "orders.review",
  "orders.cancel",
  "orders.approve_delivery",
  "orders.request_revision",
  "orders.dispute",
  "finance.release",
  "finance.refund",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Default grants per role. Sub-admin grants can be narrowed per invite. */
export const ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  super: PERMISSIONS,
  sub: [
    "users.read",
    "users.suspend",
    "users.reactivate",
    "users.reset_password",
    "orders.read",
    "orders.review",
  ],
  client: [
    "orders.read",
    "orders.approve_delivery",
    "orders.request_revision",
    "orders.dispute",
    "orders.cancel",
  ],
  professional: ["orders.read"],
  system: PERMISSIONS,
};

export const permissionsOf = (actor: { role: string; permissions?: readonly Permission[] }) =>
  actor.permissions ?? ROLE_PERMISSIONS[actor.role] ?? [];

export const hasPermissions = (
  actor: { role: string; permissions?: readonly Permission[] },
  required: readonly Permission[],
) => {
  const granted = permissionsOf(actor);
  return required.every((p) => granted.includes(p));
};
