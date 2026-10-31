/** Public API for the admin-dashboard feature (Wealthspan admin console). */
export {
  default as AdminDashboardLayout,
  ADMIN_NAV,
  type AdminSectionKey,
} from "./components/AdminDashboardLayout";
export { DashboardSection } from "./components/sections/dashboard";
export { UsersDirectorySection } from "./components/usersDirectory";
export { SubscriptionsSection } from "./components/sections/subscriptions";
export { SecuritySection } from "./components/sections/security";
export { FinanceSection } from "./components/sections/finance";
export { SystemSection } from "./components/sections/system";
