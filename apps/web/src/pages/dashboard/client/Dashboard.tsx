import { useSkeleton, DashboardSectionSkeleton } from "@jobrio/ui/design-system";
import { useState } from "react";
import {
  ClientDashboardLayout,
  type SectionKey,
  HomeSection,
  CreateOrderSection,
  OrdersSection,
  InvoicesSection,
  MessagesSection,
  WalletSection,
  NotificationsSection,
  StubSection,
  SettingsSection,
  ProfileSection,
} from "@/features/dashboard-client";
import { loadSignup } from "@jobrio/auth/signupStorage";

const TITLES: Record<
  Exclude<
    SectionKey,
    | "home"
    | "create-order"
    | "orders"
    | "invoices"
    | "messages"
    | "wallet"
    | "notifications"
    | "settings"
    | "profile"
  >,
  { t: string; s?: string }
> = {
  feedback: { t: "Feedback", s: "Tell us how we're doing." },
  support: { t: "Support", s: "We're here to help." },
  tos: { t: "Terms of Service" },
  terms: { t: "Terms & Conditions" },
  faq: { t: "FAQ" },
  oops: { t: "Oops", s: "Something went wrong? Find help here." },
  privacy: { t: "Privacy Policy" },
  sla: { t: "Service Level Agreement" },
  refund: { t: "Refund & Cancellation" },
  about: { t: "About Jobrio" },
};

const sectionVariant = (k: string) =>
  k === "home" || k === "dashboard"
    ? ("home" as const)
    : k === "messages"
      ? ("messages" as const)
      : k === "create-order"
        ? ("form" as const)
        : k === "profile"
          ? ("profile" as const)
          : k === "settings"
            ? ("settings" as const)
            : k === "orders" || k === "my-tasks" || k === "available-jobs"
              ? ("orders" as const)
              : k === "invoices"
                ? ("invoices" as const)
                : k === "wallet" || k === "earnings"
                  ? ("wallet" as const)
                  : k === "notifications"
                    ? ("notifications" as const)
                    : ("stub" as const);

const ClientDashboard = () => {
  const [active, setActive] = useState<SectionKey>("home");
  const data = loadSignup<{ fullName?: string; firstName?: string; name?: string }>("client");
  const name = data.fullName?.trim() || data.firstName?.trim() || data.name?.trim() || "Client";

  const renderSection = () => {
    switch (active) {
      case "home":
        return <HomeSection name={name} onNavigate={setActive} />;
      case "create-order":
        return <CreateOrderSection />;
      case "orders":
        return <OrdersSection onNavigate={setActive} />;
      case "invoices":
        return <InvoicesSection />;
      case "messages":
        return <MessagesSection />;
      case "wallet":
        return <WalletSection />;
      case "notifications":
        return <NotificationsSection />;
      case "settings":
        return <SettingsSection role="client" onOpenProfile={() => setActive("profile")} />;
      case "profile":
        return (
          <ProfileSection name={name} role="client" onOpenSettings={() => setActive("settings")} />
        );
      default: {
        const meta = TITLES[active];
        return <StubSection title={meta.t} subtitle={meta.s} />;
      }
    }
  };

  const switching = useSkeleton(450, active);

  return (
    <ClientDashboardLayout active={active} onChange={setActive} user={{ name }}>
      {switching ? <DashboardSectionSkeleton variant={sectionVariant(active)} /> : renderSection()}
    </ClientDashboardLayout>
  );
};

const ClientDashboardWithSkeleton = () => <ClientDashboard />;

export default ClientDashboardWithSkeleton;
