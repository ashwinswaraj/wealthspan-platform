import { useSkeleton, DashboardSectionSkeleton } from "@jobrio/ui/design-system";
import { useEffect, useState } from "react";
import {
  ProfessionalDashboardLayout,
  type ProSectionKey,
  TrialTaskSection,
  TRIAL_TASKS,
} from "@/features/dashboard-professional";
import {
  StubSection,
  NotificationsSection,
  SettingsSection,
  ProfileSection,
} from "@/features/dashboard-client";
import { loadSignup } from "@jobrio/auth/signupStorage";

const TITLES: Record<
  Exclude<
    ProSectionKey,
    "trial-1" | "trial-2" | "trial-3" | "notifications" | "settings" | "profile"
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

const STORAGE_KEY = "jobrio.trial.completed";

type CompletedMap = { "trial-1": boolean; "trial-2": boolean; "trial-3": boolean };

const loadCompleted = (): CompletedMap => {
  if (typeof window === "undefined")
    return { "trial-1": false, "trial-2": false, "trial-3": false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { "trial-1": false, "trial-2": false, "trial-3": false, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { "trial-1": false, "trial-2": false, "trial-3": false };
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

const ProfessionalDashboard = () => {
  const [active, setActive] = useState<ProSectionKey>("trial-1");
  const [completed, setCompleted] = useState<CompletedMap>(() => loadCompleted());
  const data = loadSignup<{ fullName?: string; firstName?: string; name?: string }>("professional");
  const name =
    data.fullName?.trim() || data.firstName?.trim() || data.name?.trim() || "Professional";

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    } catch {
      // ignore
    }
  }, [completed]);

  const handleComplete = (key: "trial-1" | "trial-2" | "trial-3") => {
    setCompleted((prev) => ({ ...prev, [key]: true }));
    if (key === "trial-1") setActive("trial-2");
    else if (key === "trial-2") setActive("trial-3");
  };

  const renderSection = () => {
    if (active === "trial-1" || active === "trial-2" || active === "trial-3") {
      return (
        <TrialTaskSection
          task={TRIAL_TASKS[active]}
          completed={completed[active]}
          onComplete={() => handleComplete(active)}
        />
      );
    }
    if (active === "notifications") return <NotificationsSection />;
    if (active === "settings")
      return <SettingsSection role="professional" onOpenProfile={() => setActive("profile")} />;
    if (active === "profile")
      return (
        <ProfileSection
          name={name}
          role="professional"
          onOpenSettings={() => setActive("settings")}
        />
      );
    const meta = TITLES[active];
    return <StubSection title={meta.t} subtitle={meta.s} />;
  };

  const switching = useSkeleton(450, active);

  return (
    <ProfessionalDashboardLayout
      active={active}
      onChange={setActive}
      user={{ name }}
      completed={completed}
    >
      {switching ? <DashboardSectionSkeleton variant={sectionVariant(active)} /> : renderSection()}
    </ProfessionalDashboardLayout>
  );
};

const ProfessionalDashboardWithSkeleton = () => <ProfessionalDashboard />;

export default ProfessionalDashboardWithSkeleton;
