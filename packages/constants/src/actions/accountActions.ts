/* ------------------------------------------------------------------
 * Account actions (Users Directory, Access Control, any future surface).
 * ------------------------------------------------------------------ */

import type { AccountState } from "./accountLifecycle";
import type { ActionDefinition } from "./types";

/** Minimum shape any surface must provide to resolve account actions. */
export type AccountResource = {
  id: string;
  status: AccountState;
  /** "Client" | "Professional" | "Admin" */
  type: string;
};

/**
 * Professionals are controlled by Workforce Control (hiring, trials, tiers,
 * suspension) — the Users Directory is read-only for them. That rule lives
 * here once instead of being re-expressed as a JSX condition per surface.
 */
const notProfessional = ({ resource }: { resource: AccountResource }) =>
  resource.type === "Professional"
    ? "Professional accounts are managed from Workforce Control."
    : (true as const);

export const ACCOUNT_ACTIONS: readonly ActionDefinition<AccountState, AccountResource>[] = [
  {
    id: "account.review",
    label: "Review Account",
    resource: "account",
    icon: "fact_check",
    tone: "primary",
    group: "primary",
    allowedStates: ["Suspended", "Blocked"],
    requiredPermissions: ["users.read"],
  },
  {
    id: "account.suspend",
    label: "Suspend",
    resource: "account",
    icon: "pause_circle",
    tone: "warning",
    group: "secondary",
    allowedStates: ["Active"],
    to: "Suspended",
    requiredPermissions: ["users.suspend"],
    requiresConfirmation: true,
    requiresReason: true,
    availability: notProfessional,
  },
  {
    id: "account.block",
    label: "Block",
    resource: "account",
    icon: "block",
    tone: "danger",
    group: "secondary",
    allowedStates: ["Active", "Suspended"],
    to: "Blocked",
    requiredPermissions: ["users.block"],
    destructive: true,
    requiresConfirmation: true,
    requiresReason: true,
    availability: notProfessional,
  },
  {
    id: "account.reactivate",
    label: "Reactivate",
    resource: "account",
    icon: "restart_alt",
    tone: "success",
    group: "secondary",
    allowedStates: ["Suspended", "Blocked"],
    to: "Active",
    requiredPermissions: ["users.reactivate"],
    requiresConfirmation: true,
    requiresReason: true,
    availability: notProfessional,
  },
  {
    id: "account.reset_password",
    label: "Reset Password",
    resource: "account",
    icon: "lock_reset",
    tone: "neutral",
    group: "secondary",
    allowedStates: ["Active", "Suspended"],
    requiredPermissions: ["users.reset_password"],
    requiresConfirmation: true,
    availability: notProfessional,
  },
  {
    id: "account.change_role",
    label: "Change Role",
    resource: "account",
    icon: "manage_accounts",
    tone: "neutral",
    group: "secondary",
    allowedStates: ["Active"],
    requiredPermissions: ["users.change_role"],
    requiresConfirmation: true,
    availability: ({ resource }) =>
      resource.type === "Admin" ? true : "Only admin accounts have a platform role.",
  },
  {
    id: "account.delete",
    label: "Delete Account",
    resource: "account",
    icon: "delete",
    tone: "danger",
    group: "overflow",
    allowedStates: ["Active", "Suspended", "Blocked"],
    to: "Deleted",
    requiredPermissions: ["users.delete"],
    destructive: true,
    requiresConfirmation: true,
    requiresReason: true,
    availability: notProfessional,
  },
];
