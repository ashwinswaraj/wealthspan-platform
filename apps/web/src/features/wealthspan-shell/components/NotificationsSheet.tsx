import { useState } from "react";
import { readMuted, writeMuted, type Broadcast } from "../hooks/useBroadcasts";

type Filter = "all" | "unread" | Broadcast["severity"];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "INFO", label: "Updates" },
  { id: "WARNING", label: "Important" },
  { id: "CRITICAL", label: "Critical" },
];
const TAG: Record<Broadcast["severity"], string> = {
  INFO: "Announcement",
  WARNING: "Important",
  CRITICAL: "Critical",
};

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

function ago(iso: string, now = Date.now()) {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

function groupLabel(iso: string) {
  const diff = Math.round((dayStart(new Date()) - dayStart(new Date(iso))) / 86_400_000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const iconProps = {
  className: "w-5 h-5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Full-page notifications, as in the original design, fed by announcements from the Wealthspan team. */
export function NotificationsSheet({
  broadcasts,
  isUnread,
  onMarkAllRead,
  onClose,
}: {
  broadcasts: Broadcast[];
  isUnread: (b: Broadcast) => boolean;
  onMarkAllRead: () => void;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  // Keep what was unread when the page opened, so cards don't flip while the person is reading.
  const [unreadIds] = useState(() => new Set(broadcasts.filter(isUnread).map((b) => b.id)));
  const [markedAll, setMarkedAll] = useState(false);
  const [prefs, setPrefs] = useState(false);
  const [dot, setDot] = useState(() => !readMuted());
  const unread = (b: Broadcast) => !markedAll && unreadIds.has(b.id);
  const shown = broadcasts.filter((b) =>
    filter === "all" ? true : filter === "unread" ? unread(b) : b.severity === filter,
  );
  const anyUnread = broadcasts.some(unread);

  const groups: { label: string; items: Broadcast[] }[] = [];
  for (const b of shown) {
    const label = groupLabel(b.createdAt);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(b);
    else groups.push({ label, items: [b] });
  }

  const round =
    "w-11 h-11 rounded-full border border-[#ebebeb] dark:border-[#262a33] shadow-sm flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1d24] active:bg-gray-200 dark:active:bg-[#262a33] focus:outline-none active:scale-95 transition-all duration-150 cursor-pointer shrink-0 bg-white dark:bg-[#16191f]";
  const chip = (on: boolean) =>
    `px-4 py-2 rounded-full text-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${on ? "font-semibold shadow-xs bg-black dark:bg-white text-white dark:text-black" : "bg-white dark:bg-[#16191f] border border-[#ebebeb] dark:border-[#262a33] text-gray-700 dark:text-gray-200 font-medium hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1f232b]"}`;

  return (
    <div
      id="notificationsPageOverlay"
      className="fixed inset-0 z-50 bg-[#f9f9f9] dark:bg-[#0d0f12] flex justify-center items-start overflow-hidden text-gray-900 dark:text-gray-100"
    >
      <div className="w-full max-w-[500px] h-[100dvh] bg-[#f9f9f9] dark:bg-[#0d0f12] flex flex-col justify-between overflow-hidden relative">
        <header className="w-full pt-2 sm:pt-3 px-5 sm:px-6 pb-2 z-30 shrink-0 sticky top-0 relative flex flex-col gap-2.5">
          <div
            className="absolute inset-x-0 top-0 h-[116px] sm:h-[124px] pointer-events-none z-10 bg-gradient-to-b from-[#f9f9f9]/85 dark:from-[#0d0f12]/85 from-0% via-[#f9f9f9]/70 dark:via-[#0d0f12]/70 via-50% via-[#f9f9f9]/35 dark:via-[#0d0f12]/35 via-78% via-[#f9f9f9]/10 dark:via-[#0d0f12]/10 via-92% to-transparent backdrop-blur-[3px]"
            aria-hidden="true"
          />
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Go back" onClick={onClose} className={round}>
                <svg
                  className="w-5 h-5 stroke-[2.25]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <h1 className="relative z-20 text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
                  Notifications
                </h1>
                {anyUnread ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                ) : null}
              </div>
            </div>
            <button
              type="button"
              title="Mark all as read"
              aria-label="Mark all as read"
              onClick={() => {
                setMarkedAll(true);
                onMarkAllRead();
              }}
              className={round}
            >
              <svg
                className="w-4 h-4 stroke-[2.25]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
          <div className="relative z-20 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={chip(filter === f.id)}
              >
                <span>{f.label}</span>
                {f.id === "all" ? (
                  <span
                    className={`text-[11px] font-semibold py-0.5 px-2 rounded-full ${filter === "all" ? "bg-neutral-800 dark:bg-neutral-200 text-gray-200 dark:text-neutral-900" : ""}`}
                  >
                    {broadcasts.length}
                  </span>
                ) : null}
                {f.id === "unread" && anyUnread ? (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                ) : null}
              </button>
            ))}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto no-scrollbar px-5 sm:px-6 -mt-[92px] sm:-mt-[98px] pt-[104px] sm:pt-[110px] -mb-[80px] pb-[92px]">
          {groups.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-24">Nothing new right now.</p>
          ) : (
            <div className="space-y-5 pt-1">
              {groups.map((g) => {
                const fresh = g.items.filter(unread).length;
                return (
                  <div key={g.label} className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {g.label}
                      </span>
                      {fresh ? (
                        <span className="text-xs text-gray-600 font-medium">{fresh} new</span>
                      ) : null}
                    </div>
                    {g.items.map((b) => {
                      const u = unread(b);
                      return (
                        <article
                          key={b.id}
                          className="p-4 rounded-2xl bg-white dark:bg-[#16191f] border border-[#ebebeb] dark:border-[#262a33] shadow-sm flex items-start gap-3.5 transition-all hover:border-gray-300 dark:hover:border-[#383e4d] active:scale-[0.99] cursor-pointer relative overflow-hidden"
                        >
                          {u ? (
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black dark:bg-white rounded-l-2xl" />
                          ) : null}
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${u ? "bg-black dark:bg-white text-white dark:text-black shadow-sm" : "bg-white dark:bg-[#1f232b] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#2a2f3a] shadow-2xs"}`}
                          >
                            <svg {...iconProps}>
                              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h2
                                className={`text-sm text-gray-950 dark:text-white truncate ${u ? "font-bold" : "font-semibold"}`}
                              >
                                {b.title}
                              </h2>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {ago(b.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-normal whitespace-pre-wrap">
                              {b.body}
                            </p>
                            <div className="pt-1.5 flex items-center gap-2">
                              {u ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                                  {TAG[b.severity]}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-white dark:bg-[#1f232b] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#2a2f3a] shadow-2xs">
                                  {TAG[b.severity]}
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </main>
        {prefs ? (
          <div
            className="absolute inset-0 z-40 flex items-end bg-black/40"
            onClick={() => setPrefs(false)}
          >
            <div
              className="w-full rounded-t-[28px] bg-white dark:bg-[#16191f] p-6 pb-8 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-gray-950 dark:text-white">
                Notification Preferences
              </h2>
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <span>
                  <span className="block text-sm font-semibold text-gray-950 dark:text-white">
                    Red dot for new announcements
                  </span>
                  <span className="block text-xs text-gray-500">
                    Shown on the bell when the Wealthspan team posts something new.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={dot}
                  onChange={(e) => {
                    setDot(e.target.checked);
                    writeMuted(!e.target.checked);
                  }}
                  className="w-5 h-5 accent-black"
                />
              </label>
              <button
                type="button"
                onClick={() => setPrefs(false)}
                className="w-full h-12 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
        <footer className="w-full pb-3.5 sm:pb-4 pt-2 px-5 sm:px-6 z-30 shrink-0 select-none sticky bottom-0 relative">
          <div
            className="absolute inset-x-0 bottom-0 -top-4 pointer-events-none z-10 bg-gradient-to-t from-[#f9f9f9]/95 dark:from-[#0d0f12]/95 from-0% via-[#f9f9f9]/85 dark:via-[#0d0f12]/85 via-45% via-[#f9f9f9]/45 dark:via-[#0d0f12]/45 via-75% via-[#f9f9f9]/15 dark:via-[#0d0f12]/15 via-90% to-transparent backdrop-blur-[4px]"
            aria-hidden="true"
          />
          <div className="relative z-20 w-full flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2 font-medium">
                <svg
                  className="w-4 h-4 text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Notification Preferences
              </span>
              <button
                type="button"
                className="text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-normal pt-0.5">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>End-to-End Encrypted Notifications</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
