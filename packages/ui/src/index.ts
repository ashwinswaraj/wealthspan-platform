/**
 * @jobrio/ui — shared UI layer.
 *
 * The design system is the single source of truth for product UI. Raw shadcn
 * primitives live under `@jobrio/ui/components/*` and must only be consumed by
 * the design system itself.
 */
export * from "./design-system";

export { default as AnimatedPlaceholder } from "./shared/AnimatedPlaceholder";
export {
  AuditListPage,
  type AuditListTab,
  type AuditSortOption,
  type AuditSearchConfig,
  type AuditListPageProps,
} from "./shared/AuditListPage";
export { default as ClientIdCard } from "./shared/ClientIdCard";
export { LogoBriefcase } from "./shared/LogoBriefcase";
export { default as NotificationBellIcon } from "./shared/NotificationBellIcon";
export { default as ProfessionalIdCard } from "./shared/ProfessionalIdCard";
export { default as QrScannerModal } from "./shared/QrScannerModal";
export { default as SidebarToggleIcon } from "./shared/SidebarToggleIcon";
