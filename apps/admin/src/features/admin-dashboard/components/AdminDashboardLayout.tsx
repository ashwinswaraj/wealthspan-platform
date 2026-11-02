import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRightLeft,
  CreditCard,
  LayoutGrid,
  Receipt,
  ShieldCheck,
  SlidersVertical,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAdminHealth, useAdminOverview } from "../lib/adminApi";
import { AdminNotificationsModal, type AdminNotification } from "./AdminNotificationsModal";
import { AdminProfileModal } from "./AdminProfileModal";

export type AdminSectionKey =
  "dashboard" | "users" | "subscriptions" | "security" | "finance" | "system";

export const ADMIN_NAV: { key: AdminSectionKey; label: string; icon: LucideIcon }[] = [
  { key: "dashboard", label: "Overview", icon: LayoutGrid },
  { key: "users", label: "User Directory", icon: Users },
  { key: "subscriptions", label: "Subscriptions & Billing", icon: CreditCard },
  { key: "security", label: "Security & Access Logs", icon: ShieldCheck },
  { key: "finance", label: "Financial Ledger & Projects", icon: Receipt },
  { key: "system", label: "System Configuration & Health", icon: SlidersVertical },
];
const NAV = ADMIN_NAV;

const ACTIVE_CLS =
  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left cursor-pointer bg-[#0d0d0d] dark:bg-[#ffffff] text-[#ffffff] dark:text-[#0d0d0d] font-semibold shadow-xs";
const INACTIVE_CLS =
  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left cursor-pointer text-[#737373] dark:text-[#b4b4b4] hover:bg-[#f5f5f5] dark:hover:bg-[#2f2f2f] hover:text-[#0d0d0d] dark:hover:text-[#ececec]";

interface SidebarProps {
  active: AdminSectionKey;
  onSelect: (key: AdminSectionKey) => void;
  onClose: () => void;
  onSwitchToApp: () => void;
  onToggleTheme: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

function SidebarBody({
  active,
  onSelect,
  onClose,
  onSwitchToApp,
  onToggleTheme,
  onOpenProfile,
  onLogout,
}: SidebarProps) {
  return (
    <div className="h-full flex flex-col justify-between select-none bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec]">
      <div className="flex flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#ebebeb] dark:border-[#2f2f2f]">
          <div className="flex items-center gap-3">
            <span
              className="wealthspan-logo-tile inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-xl"
              aria-hidden="true"
            >
              <svg
                className="h-[90%] w-[90%]"
                viewBox="0 -1.25 100 100"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 68 C 30 25, 70 25, 82 68" strokeWidth="8.75" />
                <path d="M26 62 L 40 76 L 50 48 L 60 76 L 74 62" strokeWidth="9.4" />
                <circle cx="50" cy="22" r="7" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div className="flex items-baseline tracking-tight">
              <span className="text-base text-[#0d0d0d] dark:text-[#ececec] tracking-tight font-semibold">
                Wealth
              </span>
              <span className="text-base text-[#737373] dark:text-[#b4b4b4] tracking-tight font-normal">
                span
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full border border-[#ebebeb] dark:border-[#2f2f2f] text-[#0d0d0d] dark:text-[#ececec] hover:bg-[#f5f5f5] dark:hover:bg-[#2f2f2f] active:scale-95 transition-all cursor-pointer"
          >
            <svg
              viewBox="0 0 22 18"
              className="w-[18px] h-[16px]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="1.25"
                y="1.25"
                width="15.5"
                height="16.5"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line x1="6" y1="1.5" x2="6" y2="18.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-2.5">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#f5f5f5] dark:bg-[#2f2f2f] border border-[#ebebeb] dark:border-[#383838]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-[#0d0d0d] dark:text-[#ececec] uppercase tracking-wider font-semibold">
                Super Admin
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-shield-check w-4 h-4 text-emerald-500"
              aria-hidden="true"
            >
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
        </div>
        <div className="px-4 py-3">
          <span className="px-3 text-[11px] font-medium text-[#737373] dark:text-[#b4b4b4] uppercase tracking-wider">
            Navigation
          </span>
          <nav className="mt-2.5 flex flex-col gap-1">
            {NAV.map((item) => {
              const isActive = item.key === active;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelect(item.key)}
                  className={isActive ? ACTIVE_CLS : INACTIVE_CLS}
                >
                  <span
                    className={
                      isActive
                        ? "text-[#ffffff] dark:text-[#0d0d0d]"
                        : "text-[#737373] dark:text-[#b4b4b4]"
                    }
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="truncate font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 border-t border-[#ebebeb] dark:border-[#2f2f2f]">
        <div className="p-3 rounded-xl bg-[#f5f5f5] dark:bg-[#2f2f2f] border border-[#ebebeb] dark:border-[#383838] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#737373] dark:text-[#b4b4b4] uppercase tracking-wider font-semibold">
              Sign-in
            </span>
            <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec]">
              Catalyst Auth
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-lock w-4 h-4 text-emerald-500"
            aria-hidden="true"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
          <span>Wealthspan Admin</span>
          <span>HTTPS</span>
        </div>
        <div className="px-2 pt-0.5 text-[10.5px] text-neutral-400 dark:text-neutral-500 flex items-center justify-between">
          <span>Founder: Ashwin Swaraj</span>
          <span className="font-semibold text-neutral-500 dark:text-neutral-400">Wealthspan</span>
        </div>
        <div className="pt-2 flex items-center gap-1.5">
          <button
            onClick={onSwitchToApp}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#2f2f2f] dark:hover:bg-[#383838] text-[#0d0d0d] dark:text-[#ececec] text-xs font-semibold transition-colors cursor-pointer border border-neutral-200/60 dark:border-neutral-700/50"
            title="Switch to User Chat App View"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-right-left w-3.5 h-3.5"
              aria-hidden="true"
            >
              <path d="m16 3 4 4-4 4" />
              <path d="M20 7H4" />
              <path d="m8 21-4-4 4-4" />
              <path d="M4 17h16" />
            </svg>
            <span>User App</span>
          </button>
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#2f2f2f] dark:hover:bg-[#383838] text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer border border-neutral-200/60 dark:border-neutral-700/50"
            title="Switch to Dark Mode"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-moon w-4 h-4 text-neutral-700"
              aria-hidden="true"
            >
              <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
            </svg>
          </button>
          <button
            onClick={onOpenProfile}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#2f2f2f] dark:hover:bg-[#383838] text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer border border-neutral-200/60 dark:border-neutral-700/50"
            title="Admin Profile & Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-sliders-vertical w-4 h-4"
              aria-hidden="true"
            >
              <path d="M10 8h4" />
              <path d="M12 21v-9" />
              <path d="M12 8V3" />
              <path d="M17 16h4" />
              <path d="M19 12V3" />
              <path d="M19 21v-5" />
              <path d="M3 14h4" />
              <path d="M5 10V3" />
              <path d="M5 21v-7" />
            </svg>
          </button>
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-red-50 hover:text-red-600 dark:bg-[#2f2f2f] dark:hover:bg-red-950/40 dark:hover:text-red-400 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer border border-neutral-200/60 dark:border-neutral-700/50"
            title="Sign Out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-log-out w-4 h-4"
              aria-hidden="true"
            >
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

interface HeaderProps {
  initial: string;
  unread: number;
  clock: string;
  latency: string;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

function AdminHeader({
  initial,
  unread,
  clock,
  latency,
  onOpenMenu,
  onOpenNotifications,
  onOpenProfile,
}: HeaderProps) {
  return (
    <header
      id="mainHeader"
      className="w-full pt-2 sm:pt-3 px-4 pb-2 flex items-center justify-between z-30 shrink-0 sticky top-0 relative select-none"
      data-purpose="admin-top-navigation"
    >
      <div
        id="topbarSmokyFade"
        className="absolute inset-x-0 top-0 h-[74px] sm:h-[80px] pointer-events-none z-10 bg-gradient-to-b from-white/90 dark:from-[#16191f]/90 from-0% via-white/60 dark:via-[#16191f]/60 via-45% via-white/30 dark:via-[#16191f]/30 via-72% via-white/10 dark:via-[#16191f]/10 via-90% to-transparent backdrop-blur-[3px]"
        aria-hidden="true"
        style={{
          maskImage:
            "linear-gradient(rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 45%, rgba(0, 0, 0, 0.35) 75%, rgba(0, 0, 0, 0) 100%)",
        }}
      />
      <button
        onClick={onOpenMenu}
        id="openMenuBtn"
        aria-label="Toggle navigation sidebar"
        className="relative z-20 w-11 h-11 flex items-center justify-center rounded-full shadow-sm border border-[#ebebeb] dark:border-[#262a33] text-gray-700 dark:text-[#ececec] hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#262a33] active:bg-gray-200 dark:active:bg-[#262a33] focus:outline-none active:scale-95 transition-all duration-150 cursor-pointer group bg-white dark:bg-[#16191f]"
      >
        <svg
          viewBox="0 0 22 18"
          className="w-[20px] h-[18px] text-gray-800 dark:text-[#ececec] group-hover:text-black dark:group-hover:text-white group-active:text-black transition-colors"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            x="1.25"
            y="1.25"
            width="15.5"
            height="16.5"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line x1="6" y1="1.5" x2="6" y2="18.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <div className="flex items-center justify-center relative z-20">
        <div className="relative">
          <button
            id="admin-header-status-badge"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer border border-emerald-500/30 bg-white hover:bg-[#f9f9f9] dark:bg-[#212121] dark:hover:bg-[#2f2f2f] text-[#0d0d0d] dark:text-[#ececec] shadow-xs"
            title="Backend Uptime & Latency Monitor"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-500" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-clock w-3 h-3 text-[#737373] dark:text-[#b4b4b4]"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="font-medium text-[#737373] dark:text-[#b4b4b4]">{clock}</span>
            </div>
            <div className="w-px h-3 bg-[#ebebeb] dark:border-[#2f2f2f]" />
            <div className="flex items-center gap-1 font-mono">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-zap w-3 h-3 text-amber-500 shrink-0"
                aria-hidden="true"
              >
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
              </svg>
              <span className="font-semibold text-[11px] text-emerald-600 dark:text-emerald-400">
                {latency}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-down w-3 h-3 text-[#737373] dark:text-[#b4b4b4] transition-transform"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 relative z-20">
        <button
          onClick={onOpenNotifications}
          id="adminNotificationsBtn"
          aria-label="Admin System Notifications"
          className="w-11 h-11 flex items-center justify-center rounded-full shadow-sm border border-[#ebebeb] dark:border-[#262a33] text-gray-700 dark:text-[#ececec] hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#262a33] active:bg-gray-200 dark:active:bg-[#262a33] focus:outline-none active:scale-95 transition-all duration-150 cursor-pointer relative bg-white dark:bg-[#16191f]"
        >
          <div className="relative flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 text-gray-800 dark:text-[#ececec]"
              aria-hidden="true"
            >
              <path
                d="M19.3399 14.49L18.3399 12.83C18.1299 12.46 17.9399 11.76 17.9399 11.35V8.82C17.9399 6.47 16.5599 4.44 14.5699 3.49C14.0499 2.57 13.0899 2 11.9899 2C10.8999 2 9.91994 2.59 9.39994 3.52C7.44994 4.49 6.09994 6.5 6.09994 8.82V11.35C6.09994 11.76 5.90994 12.46 5.69994 12.82L4.68994 14.49C4.28994 15.16 4.19994 15.9 4.44994 16.58C4.68994 17.25 5.25994 17.77 5.99994 18.02C7.93994 18.68 9.97994 19 12.0199 19C14.0599 19 16.0999 18.68 18.0399 18.03C18.7399 17.8 19.2799 17.27 19.5399 16.58C19.7999 15.89 19.7299 15.13 19.3399 14.49Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.8297 20.01C14.4097 21.17 13.2997 22 11.9997 22C11.2097 22 10.4297 21.68 9.87969 21.11C9.55969 20.81 9.31969 20.41 9.17969 20C9.30969 20.02 9.43969 20.03 9.57969 20.05C9.80969 20.08 10.0497 20.11 10.2897 20.13C10.8597 20.18 11.4397 20.21 12.0197 20.21C12.5897 20.21 13.1597 20.18 13.7197 20.13C13.9297 20.11 14.1397 20.1 14.3397 20.07C14.4997 20.05 14.6597 20.03 14.8297 20.01Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {unread > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#16191f]">
                {unread > 99 ? "99+" : unread}
              </span>
            ) : null}
          </div>
        </button>
        <button
          onClick={onOpenProfile}
          id="adminProfileBtn"
          aria-label="Admin Profile, Root Custody & Preferences"
          className="w-11 h-11 flex items-center justify-center rounded-full shadow-sm border border-[#ebebeb] dark:border-[#262a33] hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none active:scale-95 transition-all duration-150 cursor-pointer relative p-0.5 group bg-white dark:bg-[#16191f]"
        >
          <div className="w-full h-full rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs tracking-tight shadow-2xs">
            {initial}
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center ring-2 ring-white dark:ring-[#16191f] shadow-xs"
            title="Super Admin Active Session"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-shield-check w-2.5 h-2.5 stroke-[2.2]"
              aria-hidden="true"
            >
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
        </button>
      </div>
    </header>
  );
}

/** Reads the dark/light choice from localStorage and keeps the `dark` class on <html> in sync. */
function useAdminTheme() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wealthspan_admin_theme");
      if (saved === "dark" || saved === "light") setThemeState(saved);
    } catch {
      /* storage blocked: stay on light */
    }
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const setTheme = (t: "light" | "dark") => {
    setThemeState(t);
    try {
      localStorage.setItem("wealthspan_admin_theme", t);
    } catch {
      /* ignore */
    }
  };
  return { theme, setTheme };
}

interface LayoutProps {
  active: AdminSectionKey;
  onSelect: (key: AdminSectionKey) => void;
  user: { name: string; email: string };
  onSwitchToApp: () => void;
  onLogout: () => void;
  children: ReactNode;
}

/** Admin shell: fixed sidebar (drawer on phones), top bar, notification + profile popups, scrollable content. */
export default function AdminDashboardLayout({
  active,
  onSelect,
  user,
  onSwitchToApp,
  onLogout,
  children,
}: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const { theme, setTheme } = useAdminTheme();
  const overview = useAdminOverview();
  const health = useAdminHealth();

  const latencies = (health.data ?? [])
    .map((c) => c.latencyMs)
    .filter((v): v is number => typeof v === "number");
  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : null;

  const items: AdminNotification[] = useMemo(() => {
    const list: AdminNotification[] = [];
    const pending = overview.data?.pendingPayments ?? 0;
    if (pending > 0)
      list.push({
        id: "pending-payments",
        title: `${pending} payment${pending === 1 ? "" : "s"} waiting for approval`,
        description: "Users submitted a UPI reference. Check the UTR and approve or reject.",
        badge: "Action needed",
        time: "now",
        read: readIds.has("pending-payments"),
        category: "accounts",
        action: "Open approvals",
        target: "subscriptions",
      });
    const down = (health.data ?? []).filter((c) => c.ok === false);
    if (down.length > 0)
      list.push({
        id: "services-down",
        title: `${down.length} service${down.length === 1 ? "" : "s"} not responding`,
        description: down.map((c) => c.name).join(", "),
        badge: "Attention",
        time: "now",
        read: readIds.has("services-down"),
        category: "system",
        action: "View health",
        target: "system",
      });
    return list;
  }, [overview.data, health.data, readIds]);
  const unread = items.filter((i) => !i.read).length;

  const toggleRead = (id: string) =>
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const select = (key: AdminSectionKey) => {
    onSelect(key);
    setMenuOpen(false);
  };

  const side: SidebarProps = {
    active,
    onSelect: select,
    onClose: () => setMenuOpen(false),
    onSwitchToApp,
    onToggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    onOpenProfile: () => setProfileOpen(true),
    onLogout,
  };

  return (
    <div
      id="adminPanelRoot"
      className="fixed inset-0 z-50 flex bg-[#ffffff] dark:bg-[#16191f] text-[#0d0d0d] dark:text-[#ececec] font-sans antialiased overflow-hidden select-none"
    >
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#212121] z-50 flex-col justify-between shadow-xs border-r border-[#ebebeb] dark:border-[#2f2f2f] transition-transform duration-200 ease-in-out translate-x-0">
        <SidebarBody {...side} />
      </aside>
      {menuOpen ? (
        <div id="adminDrawerOverlay" className="fixed inset-0 z-[60] lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative h-full w-64 bg-white dark:bg-[#212121] shadow-xl">
            <SidebarBody {...side} />
          </div>
        </div>
      ) : null}
      <div className="flex-1 flex flex-col w-full pl-0 lg:pl-64 transition-all duration-200 h-full overflow-hidden">
        <AdminHeader
          initial={(user.name || user.email || "A").trim().charAt(0).toUpperCase()}
          unread={unread}
          clock="--"
          latency={avgLatency === null ? "—" : `${avgLatency}ms`}
          onOpenMenu={() => setMenuOpen(true)}
          onOpenNotifications={() => setNotifOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#16191f] text-[#0d0d0d] dark:text-[#ececec] -mt-[56px] sm:-mt-[60px] pt-[64px] sm:pt-[70px]">
          {children}
        </main>
      </div>
      {notifOpen ? (
        <AdminNotificationsModal
          items={items}
          onClose={() => setNotifOpen(false)}
          onToggleRead={toggleRead}
          onMarkAllRead={() => setReadIds(new Set(items.map((i) => i.id)))}
          onNavigate={(key) => {
            setNotifOpen(false);
            select(key);
          }}
        />
      ) : null}
      {profileOpen ? (
        <AdminProfileModal
          name={user.name}
          email={user.email}
          onClose={() => setProfileOpen(false)}
          onSwitchToApp={onSwitchToApp}
          onLogout={onLogout}
          onSetTheme={setTheme}
        />
      ) : null}
    </div>
  );
}
