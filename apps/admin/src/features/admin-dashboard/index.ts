/**
 * Public API for the admin-dashboard feature.
 *
 * This feature was consolidated from the former flat `components/dashboard/`
 * folder (type-driven) into one domain-named feature (admin-dashboard).
 * It intentionally stays a single feature rather than being split into one
 * feature per section (finance, disputes, security, workforce, ...): the
 * sections share state, a shared atoms module (`sections-shared.tsx`), and a
 * single consumer (the admin dashboard page), so splitting them further would
 * be a product/ownership judgment call, not something safely inferable from
 * the code alone. See the migration report for the full rationale.
 *
 * Note: `pages/dashboard/admin/Dashboard.tsx` intentionally imports most
 * sections directly via deep paths (many wrapped in `lazy()`) instead of
 * through this barrel, to preserve per-section code-splitting. That is a
 * deliberate, documented exception to the "barrel-only" rule — importing
 * everything through this barrel would pull the whole feature into every
 * lazy chunk and defeat the code-splitting.
 */
export {
  default as AdminDashboardLayout,
  type AdminSectionKey,
} from "./components/AdminDashboardLayout";
export {
  default as GlobalSearchOverlay,
  type SearchTarget,
  targetSectionKey,
} from "./components/GlobalSearchOverlay";
export { SortDropdown, type SortOption } from "./components/SortDropdown";
export { AuditListPage, type AuditListTab, type AuditSortOption } from "./components/AuditListPage";
export {
  UsersDirectorySection,
  DIR_ALL_USERS,
  type DirectoryUser,
} from "./components/usersDirectory";
export * from "./components/adminSections";
export * from "./components/sections-shared";
export * from "./components/sections";
