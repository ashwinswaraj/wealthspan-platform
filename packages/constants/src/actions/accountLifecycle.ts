/* ------------------------------------------------------------------
 * Account lifecycle (clients, professionals, admins).
 *
 * States match the labels the Users Directory already renders
 * ("Active" | "Suspended" | "Blocked" | "Deleted") so no display code
 * needs a translation table.
 * ------------------------------------------------------------------ */

export type AccountState = "Active" | "Suspended" | "Blocked" | "Deleted";

export const ACCOUNT_STATES: readonly AccountState[] = [
  "Active",
  "Suspended",
  "Blocked",
  "Deleted",
];

/**
 * Valid transitions. `Deleted` is terminal: the repository contains no
 * evidence of an account-recovery flow, so no outbound transition is
 * defined (REQUIRES BUSINESS DECISION — see the engineering report).
 */
export const ACCOUNT_TRANSITIONS: Record<AccountState, readonly AccountState[]> = {
  Active: ["Suspended", "Blocked", "Deleted"],
  Suspended: ["Active", "Blocked", "Deleted"],
  Blocked: ["Active", "Deleted"],
  Deleted: [],
};

export const isValidAccountTransition = (from: AccountState, to: AccountState) =>
  ACCOUNT_TRANSITIONS[from]?.includes(to) ?? false;
