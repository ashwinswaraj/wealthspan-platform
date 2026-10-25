import { useSkeleton, DashboardSectionSkeleton } from "@jobrio/ui/design-system";
import { useEffect, useState } from "react";
import {
  ProfessionalActiveDashboardLayout,
  type ProActiveSectionKey,
  ProHomeSection,
  AvailableJobsSection,
  MyTasksSection,
  ProMessagesSection,
  EarningsSection,
  ProWalletSection,
} from "@/features/dashboard-professional";
import {
  NotificationsSection,
  StubSection,
  SettingsSection,
  ProfileSection,
} from "@/features/dashboard-client";
import { loadSignup } from "@jobrio/auth/signupStorage";

const TITLES: Record<
  Exclude<
    ProActiveSectionKey,
    | "home"
    | "available-jobs"
    | "my-tasks"
    | "messages"
    | "earnings"
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

const ProfessionalActiveDashboard = () => {
  const [active, setActive] = useState<ProActiveSectionKey>("home");
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("jobrio.pro.available");
      if (saved !== null) setAvailable(saved === "true");
    } catch {
      /* ignore */
    }
  }, []);

  const changeAvailable = (v: boolean) => {
    setAvailable(v);
    try {
      localStorage.setItem("jobrio.pro.available", String(v));
    } catch {
      /* ignore */
    }
  };
  const data = loadSignup<{ fullName?: string; firstName?: string; name?: string }>("professional");
  const name =
    data.fullName?.trim() || data.firstName?.trim() || data.name?.trim() || "Professional";

  const render = () => {
    switch (active) {
      case "home":
        return <ProHomeSection name={name} onNavigate={setActive} />;
      case "available-jobs":
        return <AvailableJobsSection available={available} />;
      case "my-tasks":
        return <MyTasksSection />;
      case "messages":
        return <ProMessagesSection />;
      case "earnings":
        return <EarningsSection />;
      case "wallet":
        return <ProWalletSection />;
      case "notifications":
        return <NotificationsSection />;
      case "settings":
        return <SettingsSection role="professional" onOpenProfile={() => setActive("profile")} />;
      case "profile":
        return (
          <ProfileSection
            name={name}
            role="professional"
            onOpenSettings={() => setActive("settings")}
          />
        );
      default: {
        const meta = TITLES[active];
        return <StubSection title={meta.t} subtitle={meta.s} />;
      }
    }
  };

  const switching = useSkeleton(450, active);

  return (
    <ProfessionalActiveDashboardLayout
      active={active}
      onChange={setActive}
      user={{ name }}
      available={available}
      onAvailableChange={changeAvailable}
    >
      {switching ? <DashboardSectionSkeleton variant={sectionVariant(active)} /> : render()}
    </ProfessionalActiveDashboardLayout>
  );
};

const ProfessionalActiveDashboardWithSkeleton = () => <ProfessionalActiveDashboard />;

export default ProfessionalActiveDashboardWithSkeleton;
