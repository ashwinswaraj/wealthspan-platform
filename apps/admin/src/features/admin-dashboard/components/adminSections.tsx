/**
 * Barrel module for every admin-dashboard section component.
 *
 * This file used to be a single 17,500+ line monolith holding all 19
 * section components plus their private state, types, and mock data.
 * It has been split into `sections/*.tsx` (one file per section) and
 * `sections-shared.tsx` (display atoms and catalog data genuinely used
 * by more than one section) — see CODING_STANDARDS.md §5 for the full
 * modularization history and rationale.
 *
 * `ADMIN_ORDERS` / `ADMIN_SERVICES` stay here (rather than being
 * re-exported directly from sections-shared) because GlobalSearchOverlay.tsx
 * imports them from this exact path; the aliases are kept for that one
 * external consumer.
 */
import { SD_SERVICES, ORDERS } from "@admin/features/admin-dashboard/components/sections-shared";

export { LivePane } from "./sections/live-pane";
export { DashboardSection } from "./sections/dashboard";
export { WorkforceSection } from "./sections/workforce";
export { BroadcastsSection } from "./sections/broadcasts";
export { ServicesSection } from "./sections/services";

export const ADMIN_ORDERS = ORDERS;
export const ADMIN_SERVICES = SD_SERVICES;

export { OrdersSection } from "./sections/order-desk";
export { AssignmentsSection } from "./sections/assignments";
export { QASection } from "./sections/qa";
export { QualityAnalyticsView, QualityAnalyticsSection } from "./sections/quality-analytics";
export { FinanceSection } from "./sections/finance";
export { DisputesSection } from "./sections/disputes";
export { RulesSection } from "./sections/rules";
export { AuditSection } from "./sections/audit";
export { SecuritySection } from "./sections/security";
export { AdminMessagesSection } from "./sections/admin-messages";
export { RolesSection } from "./sections/roles";
export { PoliciesSection } from "./sections/policies";
export { SystemSection } from "./sections/system";
