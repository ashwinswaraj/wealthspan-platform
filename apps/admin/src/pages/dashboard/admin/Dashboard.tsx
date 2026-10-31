import { Suspense, lazy, useState } from "react";
import AdminDashboardLayout, {
  type AdminSectionKey,
} from "@admin/features/admin-dashboard/components/AdminDashboardLayout";
import { DashboardSection } from "@admin/features/admin-dashboard/components/sections/dashboard";
import { useAdminSession } from "@admin/features/admin-dashboard/lib/adminApi";
import { catalystSignOut } from "@admin/features/admin-dashboard/lib/catalystAuth";
import AdminAuthPage from "@admin/pages/auth";

/**
 * Every non-default section is code-split: each `lazy()` import creates its own chunk,
 * so opening the admin only downloads the layout and the Overview section first.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;
const named = <K extends string>(loader: () => Promise<Record<string, unknown>>, key: K) =>
  lazy(async () => ({ default: (await loader())[key] as AnyComponent }));

const UsersDirectorySection = named(
  () => import("@admin/features/admin-dashboard/components/usersDirectory"),
  "UsersDirectorySection",
);
const SubscriptionsSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/subscriptions"),
  "SubscriptionsSection",
);
const SecuritySection = named(
  () => import("@admin/features/admin-dashboard/components/sections/security"),
  "SecuritySection",
);
const FinanceSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/finance"),
  "FinanceSection",
);
const SystemSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/system"),
  "SystemSection",
);

const Fallback = () => (
  <div className="grid place-items-center py-24">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
  </div>
);

const Centered = ({ children }: { children: React.ReactNode }) => (
  <main className="min-h-dvh grid place-items-center bg-white dark:bg-[#16191f] p-6 text-center text-neutral-600 dark:text-neutral-300">
    <div>{children}</div>
  </main>
);

export default function AdminDashboardPage() {
  const [section, setSection] = useState<AdminSectionKey>("dashboard");
  const session = useAdminSession();

  if (session.isLoading) return <Fallback />;
  // 401 = not signed in. Any other failure means the API is unreachable, not "signed out".
  if (session.error && (session.error as { status?: number }).status === 401) return <AdminAuthPage />;
  if (session.error || !session.data)
    return (
      <Centered>
        <p>Can't reach the Wealthspan API.</p>
        <button className="mt-3 underline" onClick={() => session.refetch()}>
          Try again
        </button>
      </Centered>
    );
  if (!session.data.isAdmin)
    return (
      <Centered>
        <p className="font-medium text-[#0d0d0d] dark:text-white">No admin access</p>
        <p className="mt-1 text-sm">{session.data.email} is not an administrator.</p>
        <button className="mt-3 underline" onClick={() => catalystSignOut("/admin/")}>
          Sign out
        </button>
      </Centered>
    );

  return (
    <AdminDashboardLayout
      active={section}
      onSelect={setSection}
      user={{ name: session.data.name, email: session.data.email }}
      onSwitchToApp={() => window.location.assign("/")}
      onLogout={() => catalystSignOut("/admin/")}
    >
      <Suspense fallback={<Fallback />}>
        {section === "dashboard" && <DashboardSection onManageUsers={() => setSection("users")} />}
        {section === "users" && <UsersDirectorySection />}
        {section === "subscriptions" && <SubscriptionsSection />}
        {section === "security" && <SecuritySection />}
        {section === "finance" && <FinanceSection />}
        {section === "system" && <SystemSection />}
      </Suspense>
    </AdminDashboardLayout>
  );
}
