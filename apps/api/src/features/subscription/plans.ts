/**
 * Plan prices the admin can change. The defaults in `PLANS` (types.ts) apply until an admin saves a change;
 * saved changes live in the Data Store table `plan_settings` (one row per plan id).
 */
import { PLANS, PLAN_IDS, SubscriptionError, type PlanId } from "./types";

export type PlanConfig = { label: string; pricePaise: number; days: number };
export type PlanMap = Record<PlanId, PlanConfig>;

export interface PlanSettingsStore {
  listPlanSettings(): Promise<Partial<Record<PlanId, PlanConfig>>>;
  savePlanSetting(planId: PlanId, config: PlanConfig, updatedBy: string): Promise<void>;
}

export const isPlanId = (v: unknown): v is PlanId => PLAN_IDS.includes(v as PlanId);

/** Defaults overlaid with whatever the admin saved. */
export const mergePlans = (saved: Partial<Record<PlanId, PlanConfig>>): PlanMap => ({
  trial: { ...PLANS.trial, ...(saved.trial ?? {}) },
  pro_monthly: { ...PLANS.pro_monthly, ...(saved.pro_monthly ?? {}) },
  pro_annual: { ...PLANS.pro_annual, ...(saved.pro_annual ?? {}) },
});

export const loadPlans = async (store?: PlanSettingsStore): Promise<PlanMap> => {
  if (!store) return mergePlans({});
  try {
    return mergePlans(await store.listPlanSettings());
  } catch {
    // The table may not exist yet: fall back to the built-in prices rather than break payments.
    return mergePlans({});
  }
};

/** Checks what an admin typed. Price is in rupees (whole or with paise); returns the stored shape. */
export const validatePlanInput = (
  planId: PlanId,
  input: { label?: unknown; priceRupees?: unknown; days?: unknown },
): PlanConfig => {
  const label = String(input.label ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (label.length < 2 || label.length > 60)
    throw new SubscriptionError("validation", "Plan name must be 2 to 60 characters.");
  const rupees = Number(input.priceRupees);
  const pricePaise = Math.round(rupees * 100);
  if (!Number.isFinite(rupees) || Math.abs(pricePaise - rupees * 100) > 1e-6)
    throw new SubscriptionError("validation", "Price must be a number with at most 2 decimals.");
  if (planId === "trial" ? pricePaise !== 0 : pricePaise < 100 || pricePaise > 10_000_000)
    throw new SubscriptionError(
      "validation",
      planId === "trial"
        ? "The free trial must cost 0."
        : "Price must be between 1 and 100000 rupees.",
    );
  const days = Number(input.days);
  if (!Number.isInteger(days) || days < 1 || days > 3650)
    throw new SubscriptionError("validation", "Days must be a whole number from 1 to 3650.");
  return { label, pricePaise, days };
};
