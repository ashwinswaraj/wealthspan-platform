/**
 * Moved to the shared UI package (`@jobrio/ui/shared/AuditListPage`) because
 * both the admin desks and the client dashboard use this list-page shell.
 * This file stays as a re-export so existing admin imports keep working.
 */
export {
  AuditListPage,
  AuditSearchBar,
  default,
  type AuditListTab,
  type AuditSortOption,
  type AuditSearchConfig,
  type AuditListPageProps,
} from "@jobrio/ui/shared/AuditListPage";
