import { Suspense, lazy, useEffect, useState } from "react";
import { useSkeleton, DashboardSectionSkeleton, LivePaneSkeleton } from "@jobrio/ui/design-system";
import AdminDashboardLayout, {
  AdminSectionKey,
} from "@admin/features/admin-dashboard/components/AdminDashboardLayout";
import { DashboardSection } from "@admin/features/admin-dashboard/components/sections/dashboard";
import { LivePane } from "@admin/features/admin-dashboard/components/sections/live-pane";
import GlobalSearchOverlay, {
  SearchTarget,
  targetSectionKey,
} from "@admin/features/admin-dashboard/components/GlobalSearchOverlay";

/**
 * Every non-default section is code-split: each `lazy()` import creates its own
 * chunk, so opening `/dashboard/super` only downloads the layout, the default
 * Dashboard section and the live pane.
 */
const AdminSettingsSection = lazy(
  () => import("@admin/features/admin-dashboard/components/sections/AdminSettingsSection"),
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;
const named = <K extends string>(loader: () => Promise<Record<string, unknown>>, key: K) =>
  lazy(async () => ({ default: (await loader())[key] as AnyComponent }));

const UsersDirectorySection = named(
  () => import("@admin/features/admin-dashboard/components/usersDirectory"),
  "UsersDirectorySection",
);
const WorkforceSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/workforce"),
  "WorkforceSection",
);
const ServicesSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/services"),
  "ServicesSection",
);
const OrdersSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/order-desk"),
  "OrdersSection",
);
const AssignmentsSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/assignments"),
  "AssignmentsSection",
);
const QASection = named(
  () => import("@admin/features/admin-dashboard/components/sections/qa"),
  "QASection",
);
const QualityAnalyticsSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/quality-analytics"),
  "QualityAnalyticsSection",
);
const FinanceSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/finance"),
  "FinanceSection",
);
const DisputesSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/disputes"),
  "DisputesSection",
);
const RulesSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/rules"),
  "RulesSection",
);
const PoliciesSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/policies"),
  "PoliciesSection",
);
const AuditSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/audit"),
  "AuditSection",
);
const RolesSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/roles"),
  "RolesSection",
);
const BroadcastsSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/broadcasts"),
  "BroadcastsSection",
);
const SecuritySection = named(
  () => import("@admin/features/admin-dashboard/components/sections/security"),
  "SecuritySection",
);
const SystemSection = named(
  () => import("@admin/features/admin-dashboard/components/sections/system"),
  "SystemSection",
);

interface Props {
  role?: "super" | "sub";
}

const SCREEN2_KEY = "jobrio.admin.screen2";

const AdminDashboard = ({ role = "super" }: Props) => {
  const [active, setActive] = useState<AdminSectionKey>("dashboard");
  const [query, setQuery] = useState("");
  const [openUserId, setOpenUserId] = useState<string | undefined>(undefined);
  const [openServiceId, setOpenServiceId] = useState<string | undefined>(undefined);
  const [highlightOrderId, setHighlightOrderId] = useState<string | undefined>(undefined);
  const [pendingBillOrderId, setPendingBillOrderId] = useState<string | undefined>(undefined);
  const [showLive, setShowLive] = useState<boolean>(true);
  const name = role === "sub" ? "Sub Admin" : "Super Admin";

  // Hydrate Screen 2 preference from localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(SCREEN2_KEY);
    if (raw === "false") setShowLive(false);
  }, []);

  const persistShowLive = (v: boolean) => {
    setShowLive(v);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SCREEN2_KEY, v ? "true" : "false");
    }
  };

  const handleOpen = (t: SearchTarget) => {
    setQuery("");
    if (t.section === "users") {
      setOpenUserId(t.id);
      setOpenServiceId(undefined);
      setHighlightOrderId(undefined);
    } else if (t.section === "services") {
      setOpenServiceId(t.id);
      setOpenUserId(undefined);
      setHighlightOrderId(undefined);
    } else {
      setHighlightOrderId(t.id);
      setOpenUserId(undefined);
      setOpenServiceId(undefined);
    }
    setActive(targetSectionKey(t));
  };

  const switching = useSkeleton(450, active);

  // Screen 2 (Live Pane) gets its own skeleton, independent of Screen 1's
  // nav-switch skeleton: it shows only the first time it mounts, and again
  // if the user disables it and re-enables it via the settings toggle — not
  // on every ordinary Screen 1 navigation change.
  const liveSwitching = useSkeleton(450, showLive ? "on" : "off");

  const sectionVariant = (k: AdminSectionKey) =>
    k === "dashboard"
      ? ("admin" as const)
      : k === "notifications"
        ? ("notifications" as const)
        : k === "settings"
          ? ("form" as const)
          : ("list" as const);

  const renderMain = () => {
    if (switching && !query.trim()) {
      return <DashboardSectionSkeleton variant={sectionVariant(active)} />;
    }
    if (query.trim()) {
      return <GlobalSearchOverlay query={query} onClose={() => setQuery("")} onOpen={handleOpen} />;
    }
    switch (active) {
      case "dashboard":
        return <DashboardSection name={name} onNavigate={setActive} />;
      case "users":
      case "search":
        return <UsersDirectorySection openUserId={openUserId} role={role} />;
      case "workforce":
        return <WorkforceSection />;
      case "access":
        return <RolesSection />;
      case "services":
        return <ServicesSection openServiceId={openServiceId} />;
      case "orders":
        return (
          <OrdersSection
            role={role}
            highlightOrderId={highlightOrderId}
            onApproveOrder={(orderId: string) => {
              // Approved from Order Desk → continue the workflow in Finance
              // & Escrow (Billing Center); the order itself stays visible
              // and trackable in Order Desk throughout — only its status
              // changes once the invoice is actually sent.
              setPendingBillOrderId(orderId);
              setActive("finance");
            }}
          />
        );
      case "assignments":
        return <AssignmentsSection />;
      case "qa":
        return <QASection />;
      case "finance":
        return (
          <FinanceSection
            pendingBillOrderId={pendingBillOrderId}
            onConsumePendingBillOrderId={() => setPendingBillOrderId(undefined)}
          />
        );
      case "disputes":
        return <DisputesSection />;
      case "analytics":
        return <QualityAnalyticsSection />;
      case "security":
        return <SecuritySection />;
      case "rules":
        return <RulesSection />;
      case "policies":
        return <PoliciesSection />;
      case "audit":
        return <AuditSection />;

      case "notifications":
        return <BroadcastsSection />;

      case "system":
        return <SystemSection />;
      case "settings":
        return <AdminSettingsSection showLive={showLive} onToggleLive={persistShowLive} />;
      default:
        return <DashboardSection name={name} onNavigate={setActive} />;
    }
  };

  return (
    <AdminDashboardLayout
      active={active}
      onChange={(k) => {
        setActive(k);
        setOpenUserId(undefined);
        setOpenServiceId(undefined);
        setHighlightOrderId(undefined);
        setPendingBillOrderId(undefined);
      }}
      user={{ name, role }}
      query={query}
      onQueryChange={setQuery}
      mainPane={
        <Suspense fallback={<DashboardSectionSkeleton variant={sectionVariant(active)} />}>
          {renderMain()}
        </Suspense>
      }
      livePane={liveSwitching ? <LivePaneSkeleton /> : <LivePane />}
      showLive={showLive}
    />
  );
};

export default AdminDashboard;
