import { ReactNode, useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { Search, X } from "lucide-react";
import AnimatedPlaceholder from "@jobrio/ui/shared/AnimatedPlaceholder";
import { cn } from "@jobrio/utils/utils";
import { useIsMobile } from "@jobrio/hooks/use-mobile";
import SidebarToggleIcon from "@jobrio/ui/shared/SidebarToggleIcon";
import NotificationBellIcon from "@jobrio/ui/shared/NotificationBellIcon";
import { allClients } from "@jobrio/constants/clients";
import { professionals as allProfessionals } from "@jobrio/constants/professionals";

// Camera scanner (html5-qrcode, ~880 kB) is code-split: its chunk only
// downloads when the user actually opens the scanner.
const QrScannerModal = lazy(() => import("@jobrio/ui/shared/QrScannerModal"));

export type AdminSectionKey =
  | "dashboard"
  | "users"
  | "workforce"
  | "access"
  | "services"
  | "orders"
  | "assignments"
  | "qa"
  | "finance"
  | "disputes"
  | "analytics"
  | "security"
  | "rules"
  | "policies"
  | "audit"
  | "notifications"
  | "system"
  | "settings"
  | "search";

interface NavItem {
  key: AdminSectionKey;
  label: string;
  icon: string;
  superOnly?: boolean;
}

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "users", label: "Users Directory", icon: "groups" },
  { key: "workforce", label: "Workforce Control", icon: "engineering" },
  { key: "access", label: "Access Control", icon: "admin_panel_settings", superOnly: true },
  { key: "services", label: "Services Desk", icon: "design_services" },
  { key: "orders", label: "Orders Desk", icon: "assignment" },
  { key: "assignments", label: "Assignment Engine", icon: "hub" },
  { key: "qa", label: "QA Desk", icon: "verified" },
  { key: "finance", label: "Finance & Escrow", icon: "account_balance" },
  { key: "disputes", label: "Disputes Center", icon: "gavel" },
  { key: "notifications", label: "Communication Center", icon: "campaign" },
  { key: "analytics", label: "Analytics", icon: "monitoring" },
  { key: "rules", label: "Platform Rules", icon: "rule_settings" },
  { key: "policies", label: "Policies", icon: "policy" },
  { key: "audit", label: "Audit & Logs", icon: "manage_search" },
  { key: "security", label: "Security", icon: "shield" },
  { key: "system", label: "System", icon: "settings_suggest" },
];

interface Props {
  active: AdminSectionKey;
  onChange: (k: AdminSectionKey) => void;
  user: { name: string; role?: string };
  query: string;
  onQueryChange: (v: string) => void;
  mainPane: ReactNode;
  livePane: ReactNode;
  showLive?: boolean;
}

type TopNotif = {
  id: string;
  title: string;
  body: string;
  when: string;
  tone: string;
  icon: string;
};

const TOP_NOTIFS: TopNotif[] = [
  {
    id: "n1",
    title: "New dispute opened",
    body: "DSP-118 · Order #JR-1031",
    when: "2m ago",
    tone: "text-rose-600 bg-rose-500/10",
    icon: "gavel",
  },
  {
    id: "n2",
    title: "Pro application pending",
    body: "Riya S. · UI/UX",
    when: "12m ago",
    tone: "text-primary-container bg-primary-container/10",
    icon: "person_add",
  },
  {
    id: "n3",
    title: "Escrow auto-release in 24h",
    body: "Order #JR-1027 · ₹640",
    when: "1h ago",
    tone: "text-amber-600 bg-amber-500/10",
    icon: "schedule",
  },
  {
    id: "n4",
    title: "Payment received",
    body: "Order #JR-1041 · ₹1,200",
    when: "3h ago",
    tone: "text-emerald-600 bg-emerald-500/10",
    icon: "payments",
  },
];

const SIDEBAR_W = 256;
const SIDEBAR_W_COLLAPSED = 76;

const AdminDashboardLayout = ({
  active,
  onChange,
  user,
  query,
  onQueryChange,
  mainPane,
  livePane,
  showLive = true,
}: Props) => {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [splitPct, setSplitPct] = useState(60);
  const [showScanner, setShowScanner] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const draggingRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const allIds = useMemo(
    () => [...allClients.map((c) => c.id), ...allProfessionals.map((p) => p.id)],
    [],
  );

  const handleScanResult = (decodedText: string) => {
    setShowScanner(false);
    const match = allIds.find((id) => id.toLowerCase() === decodedText.toLowerCase());
    const value = match ?? decodedText;
    onQueryChange(value);
  };

  useEffect(() => setMobileOpen(false), [active]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(80, Math.max(25, pct)));
    };
    const onTouch = (e: TouchEvent) => {
      if (!draggingRef.current || !containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(80, Math.max(25, pct)));
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouch);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const sidebarWidth = desktopCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  const NavLink = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
    const isActive = active === item.key;
    return (
      <button
        type="button"
        onClick={() => onChange(item.key)}
        title={collapsed ? item.label : undefined}
        className={cn(
          "relative w-full flex items-center gap-3 rounded-xl transition-colors overflow-hidden",
          collapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5",
          isActive
            ? "bg-[#f0f4ff] text-primary-container font-semibold"
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
          {item.icon}
        </span>

        {!collapsed && (
          <span className="text-sm font-semibold tracking-[0.01em] truncate">{item.label}</span>
        )}
      </button>
    );
  };

  const SidebarInner = ({ collapsed }: { collapsed: boolean }) => (
    <div className="h-full w-full flex flex-col bg-surface">
      <nav
        className={cn("flex-1 overflow-y-auto pb-6 pt-6 space-y-1", collapsed ? "px-2" : "px-4")}
      >
        {NAV.filter((i) => !i.superOnly || user.role === "super").map((i) => (
          <NavLink key={i.key} item={i} collapsed={collapsed} />
        ))}
      </nav>

      <div
        className={cn("shrink-0 border-t border-surface-container-high", collapsed ? "p-2" : "p-4")}
      >
        <button
          type="button"
          onClick={() => onChange("settings")}
          aria-label="Open profile settings"
          className={cn(
            "w-full flex items-center rounded-3xl border border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5 transition-colors text-left",
            collapsed ? "p-2 justify-center" : "gap-3 p-3",
          )}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
            >
              shield_person
            </span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{user.name}</p>
                <p className="text-[10px] text-outline truncate">
                  I'm {user.role === "sub" ? "a Sub" : "a Super"} Admin at Jobrio
                </p>
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

  const toggleSidebar = () => {
    if (isMobile) setMobileOpen((v) => !v);
    else setDesktopCollapsed((v) => !v);
  };

  return (
    <div className="min-h-screen w-full bg-surface">
      {/* Global TopBar — full width, above sidebar. Contains brand, toggle, search, notifications */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-surface border-b border-surface-container-high px-4 sm:px-6 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{
            background: "linear-gradient(135deg, #004AC6 0%, #004AC6 50%, #004AC6 100%)",
            boxShadow: "0 10px 25px rgba(0,74,198,0.4)",
          }}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            shield_person
          </span>
        </div>
        <div
          className="hidden md:flex items-center overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-out"
          style={{
            maxWidth: desktopCollapsed ? 0 : 160,
            opacity: desktopCollapsed ? 0 : 1,
            marginLeft: desktopCollapsed ? 0 : undefined,
          }}
        >
          <span className="text-on-background text-2xl sm:text-3xl font-extrabold font-headline tracking-tighter whitespace-nowrap">
            Jobrio
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors shrink-0 ml-1"
          aria-label="Toggle sidebar"
        >
          <SidebarToggleIcon />
        </button>

        {/* Search — inline in topbar */}
        <div className="relative flex-1 ml-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder=""
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full pl-11 pr-20 py-2.5 bg-transparent border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30 transition-all"
          />
          <AnimatedPlaceholder
            show={!query}
            phrases={[
              "Search & query across the platform…",
              "Find any user, order, or invoice…",
              "Try a client or pro card number…",
              "Lookup disputes, payments, reports…",
              "Scan a QR to jump to a profile…",
            ]}
            className="left-11 right-20 text-sm text-on-surface-variant/60"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              aria-label="Tap to scan"
              className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-xl text-primary">
                qr_code_scanner
              </span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="relative shrink-0 ml-auto" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all relative"
            aria-label="Notifications"
          >
            {notifOpen ? (
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                close
              </span>
            ) : (
              <NotificationBellIcon size={24} />
            )}
            {!notifOpen && (
              <span
                className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-surface"
                style={{ backgroundColor: "#FACC15" }}
              />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[320px] sm:w-[360px] bg-surface rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-container-high flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-on-surface leading-tight">Notifications</p>
                  <p className="text-[10px] text-outline">Personal admin alerts</p>
                </div>
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    onChange("notifications");
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  Open Center →
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto divide-y divide-surface-container-high/60">
                {TOP_NOTIFS.map((n) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 hover:bg-surface-container-low/60 flex gap-3"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                        n.tone,
                      )}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
                      >
                        {n.icon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-on-surface truncate">{n.title}</p>
                      <p className="text-[11px] text-on-surface-variant leading-snug">{n.body}</p>
                      <p className="text-[10px] text-outline mt-0.5">{n.when}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Connection status pill is now rendered globally from __root.tsx. */}

      {/* Desktop sidebar — below topbar */}
      <aside
        className="hidden md:flex fixed left-0 top-16 bottom-0 flex-col border-r border-surface-container-high z-40 transition-[width] duration-300 ease-out overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        <SidebarInner collapsed={desktopCollapsed} />
      </aside>

      {/* Mobile drawer — below topbar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] shadow-2xl">
            <SidebarInner collapsed={false} />
          </aside>
        </div>
      )}

      <main
        className="relative flex flex-col overflow-hidden transition-[margin] duration-300 ease-out"
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          marginTop: 64,
          height: "calc(100vh - 64px)",
        }}
      >
        {/* Split panes */}
        <div
          ref={containerRef}
          className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden relative bg-surface"
        >
          <section
            className="min-h-0 min-w-0 overflow-y-auto overscroll-contain w-full md:h-full"
            style={
              !showLive
                ? { width: "100%", flex: "1 1 100%" }
                : !isMobile
                  ? { width: `${splitPct}%`, flex: `0 0 ${splitPct}%` }
                  : { flex: "1 1 55%" }
            }
          >
            <div className="px-4 sm:px-6 py-6 space-y-6">{mainPane}</div>
          </section>

          {showLive && (
            <>
              {/* Splitter — desktop only */}
              <div
                role="separator"
                aria-orientation="vertical"
                onMouseDown={(e) => {
                  e.preventDefault();
                  draggingRef.current = true;
                  document.body.style.cursor = "col-resize";
                  document.body.style.userSelect = "none";
                }}
                onTouchStart={() => {
                  draggingRef.current = true;
                }}
                onDoubleClick={() => setSplitPct(60)}
                className="hidden md:flex relative w-1.5 cursor-col-resize bg-surface-container-high hover:bg-primary/20 transition-colors items-center justify-center group shrink-0"
                title="Drag to resize · double-click to reset"
              >
                <div className="relative z-10 flex flex-col items-center justify-center gap-1 w-2 h-12 rounded-full bg-surface border border-outline-variant shadow-md group-hover:border-primary group-hover:shadow-lg transition-all">
                  <span className="w-0.5 h-0.5 rounded-full bg-on-surface-variant group-hover:bg-primary" />
                  <span className="w-0.5 h-0.5 rounded-full bg-on-surface-variant group-hover:bg-primary" />
                  <span className="w-0.5 h-0.5 rounded-full bg-on-surface-variant group-hover:bg-primary" />
                </div>
              </div>

              <aside
                className="min-h-0 min-w-0 flex flex-col overflow-y-auto overscroll-contain bg-surface border-t md:border-t-0 md:border-l border-surface-container-high w-full md:h-full"
                style={
                  !isMobile
                    ? { width: `${100 - splitPct}%`, flex: `0 0 ${100 - splitPct}%` }
                    : { flex: "1 1 45%" }
                }
              >
                <div className="px-4 py-3 sticky top-0 bg-surface/95 backdrop-blur border-b border-surface-container-high flex items-center gap-2 z-10">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
                  >
                    bolt
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-on-surface leading-tight">Workspace</p>
                    <p className="text-[10px] text-outline leading-tight">
                      Live actions, queues & alerts in one workspace
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="px-4 py-4 space-y-3">{livePane}</div>
              </aside>
            </>
          )}
        </div>
      </main>
      {showScanner && (
        <Suspense fallback={null}>
          <QrScannerModal
            open={showScanner}
            onClose={() => setShowScanner(false)}
            onScanResult={handleScanResult}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AdminDashboardLayout;
