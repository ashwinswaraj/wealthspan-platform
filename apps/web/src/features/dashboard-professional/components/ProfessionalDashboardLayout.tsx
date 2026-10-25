import { ReactNode, useEffect, useState } from "react";
import { cn } from "@jobrio/utils/utils";
import SidebarToggleIcon from "@jobrio/ui/shared/SidebarToggleIcon";
import { LogoBriefcase } from "@jobrio/ui/shared/LogoBriefcase";
import { useIsMobile } from "@jobrio/hooks/use-mobile";
import NotificationBellIcon from "@jobrio/ui/shared/NotificationBellIcon";

export type ProSectionKey =
  | "trial-1"
  | "trial-2"
  | "trial-3"
  | "notifications"
  | "settings"
  | "profile"
  | "feedback"
  | "support"
  | "tos"
  | "faq"
  | "oops"
  | "privacy"
  | "sla"
  | "refund"
  | "about";

interface NavItem {
  key: ProSectionKey;
  label: string;
  icon: string;
}

const PRIMARY: NavItem[] = [
  { key: "trial-1", label: "Trial 1", icon: "task_alt" },
  { key: "trial-2", label: "Trial 2", icon: "assignment" },
  { key: "trial-3", label: "Trial 3", icon: "checklist" },
];

const SECONDARY: NavItem[] = [
  { key: "settings", label: "Settings", icon: "settings" },
  { key: "feedback", label: "Feedback", icon: "rate_review" },
  { key: "support", label: "Support", icon: "contact_support" },
  { key: "tos", label: "Terms", icon: "gavel" },
  { key: "faq", label: "FAQ", icon: "help" },
  { key: "oops", label: "Oops", icon: "error" },
];

const POLICIES: NavItem[] = [
  { key: "privacy", label: "Privacy Policy", icon: "shield" },
  { key: "sla", label: "SLA", icon: "description" },
  { key: "refund", label: "Refunds", icon: "autorenew" },
  { key: "about", label: "About", icon: "info" },
];

const ToggleIcon = SidebarToggleIcon;
const SIDEBAR_W = 256;
const SIDEBAR_W_COLLAPSED = 76;

interface Props {
  active: ProSectionKey;
  onChange: (k: ProSectionKey) => void;
  user: { name: string };
  children: ReactNode;
  completed?: { "trial-1": boolean; "trial-2": boolean; "trial-3": boolean };
}

const ProfessionalDashboardLayout = ({
  active,
  onChange,
  user,
  children,
  completed = { "trial-1": false, "trial-2": false, "trial-3": false },
}: Props) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setMobileOpen(false);
  }, [active]);

  const isLocked = (key: ProSectionKey) => {
    if (key === "trial-2") return !completed["trial-1"];
    if (key === "trial-3") return !completed["trial-2"];
    return false;
  };

  const NavLink = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
    const isActive = active === item.key;
    const locked = isLocked(item.key);
    return (
      <button
        type="button"
        onClick={() => {
          if (locked) return;
          onChange(item.key);
        }}
        aria-disabled={locked}
        title={collapsed ? item.label : undefined}
        className={cn(
          "relative w-full flex items-center gap-3 rounded-xl transition-colors overflow-hidden",
          collapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5",
          isActive
            ? "bg-[#f0f4ff] text-primary-container font-semibold"
            : locked
              ? "text-outline/60 cursor-not-allowed"
              : "text-on-surface-variant hover:bg-surface-container-low",
        )}
      >
        {isActive && !collapsed && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl border-l-4 border-primary"
          />
        )}
        <span
          className="material-symbols-outlined shrink-0"
          style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {locked
            ? "lock"
            : completed[item.key as keyof typeof completed]
              ? "check_circle"
              : item.icon}
        </span>
        {!collapsed && (
          <>
            <span className="text-sm font-semibold tracking-[0.01em] flex-1 truncate">
              {item.label}
            </span>
            {locked && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-outline/60">
                Locked
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  const SidebarInner = ({ collapsed }: { collapsed: boolean }) => (
    <div className="h-full w-full flex flex-col bg-surface">
      <nav
        className={cn("flex-1 overflow-y-auto pb-6 pt-6 space-y-1", collapsed ? "px-2" : "px-4")}
      >
        <div className="space-y-1 mb-8">
          {!collapsed && (
            <p className="px-4 pb-2 text-[10px] uppercase tracking-widest text-outline font-bold">
              Trial Tasks
            </p>
          )}
          {PRIMARY.map((i) => (
            <NavLink key={i.key} item={i} collapsed={collapsed} />
          ))}
        </div>

        <div className="pt-6 space-y-1">
          {!collapsed && (
            <p className="px-4 pb-2 text-[10px] uppercase tracking-widest text-outline font-bold">
              Preferences
            </p>
          )}
          {SECONDARY.map((i) => (
            <NavLink key={i.key} item={i} collapsed={collapsed} />
          ))}
        </div>

        {!collapsed && (
          <div className="pt-6 border-t border-outline-variant/20 mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setPoliciesOpen((v) => !v);
              }}
              className="w-full flex items-center justify-between px-4 py-2 text-outline hover:text-primary transition-all"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Company Policies
              </span>
              <span
                className="material-symbols-outlined text-sm transition-transform"
                style={{ transform: policiesOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                {policiesOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-[max-height] duration-300",
                policiesOpen ? "max-h-96" : "max-h-0",
              )}
            >
              <div className="space-y-1 py-2">
                {POLICIES.map((p) => (
                  <NavLink key={p.key} item={p} collapsed={false} />
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      <div
        className={cn("shrink-0 border-t border-surface-container-high", collapsed ? "p-2" : "p-4")}
      >
        <button
          type="button"
          onClick={() => onChange("profile")}
          aria-label="Open profile"
          className={cn(
            "w-full flex items-center rounded-3xl border border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5 transition-colors text-left",
            collapsed ? "p-2 justify-center" : "gap-3 p-3",
          )}
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9vhTcCQikB8T9MsVGe1s3gVWD9KajbL_sKAMf2G44mAv_M4U8OM9X7hdDb4116_PKxpM5KYW9s6PaxuTMGlhIJxspLNkfqnMfZ_K2gh_kN-4V62M_5cITr0emrfvKYim2NC_lPMuPQTIlhQS4TXf9TYhNitfBSqsZXtk-OvKZs8QrW7ZYqwg9ow3WA_kn7AuGPhnf4DjVDwxlae7pAsBw0_8gSZ8gdA8lc7aqep5TymfPBf6TG4_bmqL_U4fBHFUl7k9OJ5-lckCB"
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{user.name}</p>
                <p className="text-[10px] text-outline truncate">I'm a Professional at Jobrio</p>
              </div>
              <span className="w-7 h-7 flex items-center justify-center text-outline">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  arrow_forward_ios
                </span>
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const sidebarWidth = desktopCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  return (
    <div className="min-h-screen w-full bg-surface">
      {/* TopBar — full width, above sidebar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface border-b border-surface-container-high px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{
              background: "linear-gradient(135deg, #004AC6 0%, #004AC6 50%, #004AC6 100%)",
              boxShadow: "0 10px 25px rgba(0,74,198,0.4)",
            }}
          >
            <LogoBriefcase />
          </div>
          {!desktopCollapsed && !isMobile && (
            <span className="hidden md:inline text-on-background text-2xl sm:text-3xl font-extrabold font-headline tracking-tighter">
              Jobrio
            </span>
          )}
          <button
            onClick={() => (isMobile ? setMobileOpen((v) => !v) : setDesktopCollapsed((v) => !v))}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors ml-1"
            aria-label="Toggle sidebar"
          >
            <ToggleIcon />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onChange(active === "notifications" ? "trial-1" : "notifications")}
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all relative"
            aria-label={active === "notifications" ? "Close notifications" : "Notifications"}
          >
            {active === "notifications" ? (
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                close
              </span>
            ) : (
              <NotificationBellIcon size={24} />
            )}
            {active !== "notifications" && (
              <span
                className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-surface"
                style={{ backgroundColor: "#FACC15" }}
              />
            )}
          </button>
        </div>
      </header>

      <aside
        className="hidden md:flex fixed left-0 top-16 bottom-0 flex-col border-r border-surface-container-high z-40 transition-[width] duration-300 ease-out overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        <SidebarInner collapsed={desktopCollapsed} />
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] shadow-2xl">
            <SidebarInner collapsed={false} />
          </aside>
        </div>
      )}

      <main
        className="min-h-screen relative pt-16 transition-[margin] duration-300 ease-out"
        style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">{children}</div>
      </main>
    </div>
  );
};

export default ProfessionalDashboardLayout;
