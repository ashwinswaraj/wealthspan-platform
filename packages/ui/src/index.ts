/**
 * @jobrio/ui — shared UI layer.
 *
 * The design system is the single source of truth for product UI. Raw shadcn
 * primitives live under `@jobrio/ui/components/*` and must only be consumed by
 * the design system itself.
 */
export * from "./design-system";

export { default as AnimatedPlaceholder } from "./shared/AnimatedPlaceholder";
export { default as NotificationBellIcon } from "./shared/NotificationBellIcon";
export { default as SidebarToggleIcon } from "./shared/SidebarToggleIcon";
