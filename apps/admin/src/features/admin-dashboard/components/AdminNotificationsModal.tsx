import { useState } from "react";
import type { AdminSectionKey } from "./AdminDashboardLayout";

export interface AdminNotification {
  id: string;
  title: string;
  description: string;
  badge: string;
  time: string;
  read: boolean;
  category: "security" | "accounts" | "ledger" | "system";
  action: string;
  target: AdminSectionKey;
}

type FilterKey = "all" | "security" | "accounts" | "ledger" | "system" | "unread";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "security", label: "Security" },
  { key: "accounts", label: "Accounts" },
  { key: "ledger", label: "Ledger" },
  { key: "system", label: "System" },
  { key: "unread", label: "Unread" },
];
const ACTIVE_TAB =
  "px-4 py-2 rounded-full text-xs transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 shrink-0 bg-black dark:bg-white text-white dark:text-black font-semibold shadow-xs";
const INACTIVE_TAB =
  "px-4 py-2 rounded-full text-xs transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 shrink-0 bg-white dark:bg-[#16191f] border border-[#ebebeb] dark:border-[#262a33] text-gray-700 dark:text-gray-200 font-medium hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1f232b]";

export function AdminNotificationsModal({
  items,
  onClose,
  onToggleRead,
  onMarkAllRead,
  onNavigate,
}: {
  items: AdminNotification[];
  onClose: () => void;
  onToggleRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (key: AdminSectionKey) => void;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const unread = items.filter((i) => !i.read).length;
  const visible = items.filter((i) =>
    filter === "all" ? true : filter === "unread" ? !i.read : i.category === filter,
  );
  return (
    <div
      id="adminNotificationsModalOverlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm select-none animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" aria-hidden="true" />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[88vh] bg-[#f9f9f9] dark:bg-[#0d0f12] rounded-[28px] shadow-[0_16px_44px_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.06)] border border-[#ebebeb] dark:border-[#262a33] text-[#0d0d0d] dark:text-[#ececec] flex flex-col overflow-hidden"
        style={{ opacity: "1", transform: "none" }}
      >
        <header
          className="w-full pt-3 sm:pt-4 px-5 sm:px-6 pb-2.5 z-30 shrink-0 sticky top-0 relative flex flex-col gap-2.5"
          data-purpose="fixed-top-header"
        >
          <div
            id="adminNotificationsTopbarSmokyFade"
            className="absolute inset-x-0 top-0 h-[116px] sm:h-[124px] pointer-events-none z-10 bg-gradient-to-b from-[#f9f9f9]/85 dark:from-[#0d0f12]/85 from-0% via-[#f9f9f9]/70 dark:via-[#0d0f12]/70 via-50% via-[#f9f9f9]/35 dark:via-[#0d0f12]/35 via-78% via-[#f9f9f9]/10 dark:via-[#0d0f12]/10 via-92% to-transparent backdrop-blur-[3px]"
            aria-hidden="true"
            style={{
              maskImage:
                "linear-gradient(rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.35) 78%, rgba(0, 0, 0, 0) 100%)",
            }}
          />
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white dark:bg-[#16191f] border border-[#ebebeb] dark:border-[#262a33] shadow-sm flex items-center justify-center text-gray-700 dark:text-gray-200 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-gray-800 dark:text-gray-100"
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
              </div>
              <h1 className="relative z-20 text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
                Notifications
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Mark all as read"
                className="w-11 h-11 rounded-full bg-white dark:bg-[#16191f] border border-[#ebebeb] dark:border-[#262a33] shadow-sm flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1d24] active:scale-95 transition-all duration-150 cursor-pointer shrink-0"
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
                  className="lucide lucide-check w-4 h-4 stroke-[2.25]"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </button>
              <button
                onClick={onClose}
                type="button"
                aria-label="Close notifications"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-[#16191f] border border-[#ebebeb] dark:border-[#262a33] shadow-sm text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1d24] active:scale-95 transition-all cursor-pointer shrink-0"
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
                  className="lucide lucide-x w-4 h-4 stroke-[2.25]"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="relative z-20 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
            {FILTERS.map((f) => {
              const count =
                f.key === "all"
                  ? items.length
                  : f.key === "unread"
                    ? unread
                    : items.filter((i) => i.category === f.key).length;
              return (
                <button
                  key={f.key}
                  id={`admin-filter-tab-${f.key}`}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={filter === f.key ? ACTIVE_TAB : INACTIVE_TAB}
                >
                  <span>{f.label}</span>
                  {f.key === "unread" ? (
                    unread > 0 ? (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    ) : null
                  ) : (
                    <span>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 sm:px-6 -mt-[96px] sm:-mt-[104px] pt-[108px] sm:pt-[116px] pb-6 space-y-3">
          {visible.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No notifications yet.
            </p>
          ) : (
            visible.map((item) => (
              <div
                key={item.id}
                className={`p-4.5 rounded-[22px] border transition-all bg-white dark:bg-[#1e232d] shadow-xs ${item.read ? "border-[#ebebeb] dark:border-[#262a33]" : "border-black/20 dark:border-white/20"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-[#262a33] shrink-0 mt-0.5">
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
                        className="lucide lucide-receipt w-4 h-4 stroke-[1.9] text-gray-950 dark:text-white"
                        aria-hidden="true"
                      >
                        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                        <path d="M12 17.5v-11" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {item.title}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-neutral-100 dark:bg-[#262a33] text-gray-950 dark:text-white border border-[#ebebeb] dark:border-[#383d4a]">
                          {item.badge}
                        </span>
                        {!item.read ? (
                          <span className="w-2 h-2 rounded-full bg-black dark:bg-white shrink-0 animate-pulse" />
                        ) : null}
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
                        <span className="flex items-center gap-1">
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
                            className="lucide lucide-clock w-3 h-3 stroke-[1.9]"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    title="Mark as read"
                    onClick={() => onToggleRead(item.id)}
                    className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-[#262a33] transition-colors shrink-0 cursor-pointer"
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
                      className="lucide lucide-check w-4 h-4 stroke-[2.2] text-black dark:text-white"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-[#ebebeb] dark:border-[#262a33] flex items-center justify-end">
                  <button
                    onClick={() => onNavigate(item.target)}
                    className="flex items-center gap-1 text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer"
                  >
                    <span>{item.action}</span>
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
                      className="lucide lucide-chevron-right w-3.5 h-3.5 stroke-[2]"
                      aria-hidden="true"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-6 py-4 border-t border-[#ebebeb] dark:border-[#262a33] bg-[#f9f9f9] dark:bg-[#0d0f12] flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
            <span>Live updates</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onMarkAllRead}
              className="sm:hidden font-semibold text-black dark:text-white cursor-pointer"
            >
              Mark all read
            </button>
            <span>{items.length} Total Logs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
