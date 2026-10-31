import { useState } from "react";

type TabKey = "profile" | "appearance" | "security" | "telemetry";
const TABS: { key: TabKey; label: string }[] = [
  { key: "profile", label: "Admin Identity" },
  { key: "appearance", label: "Theme & Display" },
  { key: "security", label: "Security & Auth" },
  { key: "telemetry", label: "Alerts & Haptics" },
];
const ACTIVE_TAB = "px-4 py-2 rounded-full text-xs transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 shrink-0 bg-black dark:bg-white text-white dark:text-black font-semibold shadow-xs";
const INACTIVE_TAB = "px-4 py-2 rounded-full text-xs transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 shrink-0 bg-white dark:bg-[#16191f] border border-[#ebebeb] dark:border-[#262a33] text-gray-700 dark:text-gray-200 font-medium hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1f232b]";

export function AdminProfileModal({
  name,
  email,
  onClose,
  onSwitchToApp,
  onLogout,
  onSetTheme,
}: {
  name: string;
  email: string;
  onClose: () => void;
  onSwitchToApp: () => void;
  onLogout: () => void;
  onSetTheme: (theme: "light" | "dark") => void;
}) {
  const [tab, setTab] = useState<TabKey>("profile");
  const initial = (name || email || "A").trim().charAt(0).toUpperCase();
  const BODIES: Record<TabKey, React.ReactNode> = {
  profile: (
          <div className="space-y-5">
            <div className="p-4.5 rounded-[24px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-lg shadow-md">
                  {initial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-[#0d0d0d] dark:text-[#ececec]">
                      {name}
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-neutral-100 dark:bg-[#262a33] text-gray-950 dark:text-white border border-[#ebebeb] dark:border-[#383d4a]">
                      SUPER ADMIN
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-0.5">
                    {email}
                  </span>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5 block">
                    Super Admin · Full access
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <div className="px-3 py-1.5 rounded-full border border-neutral-200 dark:border-[#262a33] bg-neutral-50 dark:bg-[#16191f] flex items-center gap-1.5 text-xs text-gray-950 dark:text-white font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check w-4 h-4 stroke-[1.9]" aria-hidden="true">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>
                    Identity Verified
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Assigned Privileges
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-[20px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-start gap-3 shadow-xs">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-[#262a33] text-gray-950 dark:text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec] block">
                      Payment Approvals
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Approve or reject UPI subscription payments
                    </span>
                  </div>
                </div>
                <div className="p-3.5 rounded-[20px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-start gap-3 shadow-xs">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-[#262a33] text-gray-950 dark:text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec] block">
                      User Directory
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      View every registered user and plan
                    </span>
                  </div>
                </div>
                <div className="p-3.5 rounded-[20px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-start gap-3 shadow-xs">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-[#262a33] text-gray-950 dark:text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec] block">
                      Ledger Audit
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Read-only access to all ledger entries
                    </span>
                  </div>
                </div>
                <div className="p-3.5 rounded-[20px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-start gap-3 shadow-xs">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-[#262a33] text-gray-950 dark:text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec] block">
                      System Health
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Check service status and latency
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
  ),
  appearance: (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                Theme & Color Mode
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Select your interface theme preference. Dark mode optimizes high-contrast data tables in low-light environments.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => onSetTheme("light")} className="p-4 rounded-[20px] border text-left transition-all cursor-pointer flex flex-col justify-between h-28 relative border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10 bg-neutral-50 dark:bg-[#1e232d] shadow-sm">
                  <div className="flex items-center justify-between w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun w-5 h-5 stroke-[1.9] text-gray-950 dark:text-white" aria-hidden="true">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="m4.93 4.93 1.41 1.41" />
                      <path d="m17.66 17.66 1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="m6.34 17.66-1.41 1.41" />
                      <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                    <div className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-3 h-3 stroke-[2.5]" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0d0d0d] dark:text-[#ececec] block">
                      Light Mode
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">
                      Crisp high-clarity daylight theme
                    </span>
                  </div>
                </button>
                <button onClick={() => onSetTheme("dark")} className="p-4 rounded-[20px] border text-left transition-all cursor-pointer flex flex-col justify-between h-28 relative border-[#ebebeb] dark:border-[#262a33] bg-white dark:bg-[#1e232d] hover:border-neutral-300 dark:hover:border-neutral-600">
                  <div className="flex items-center justify-between w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon w-5 h-5 stroke-[1.9] text-gray-950 dark:text-white" aria-hidden="true">
                      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0d0d0d] dark:text-[#ececec] block">
                      Dark Mode
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">
                      Eye-safe OLED dark gray canvas
                    </span>
                  </div>
                </button>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Visual Calibration
              </h3>
              <div className="p-4 rounded-[20px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec] block">
                    High Contrast Data Borders
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">
                    Sharpens table dividers and ledger grid lines
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input className="sr-only peer" type="checkbox" />
                  <div className="w-[46px] h-7 bg-[#e5e7eb] dark:bg-[#2b303c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white dark:peer-checked:after:border-black after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white dark:after:bg-white dark:peer-checked:after:bg-black after:rounded-full after:h-[22px] after:w-[22px] after:shadow-sm after:transition-all peer-checked:bg-black dark:peer-checked:bg-white" />
                </label>
              </div>
            </div>
          </div>
  ),
  security: (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                Authentication & Session Security
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-[20px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key w-5 h-5 stroke-[1.9] text-gray-950 dark:text-white shrink-0" aria-hidden="true">
                      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
                      <path d="m21 2-9.6 9.6" />
                      <circle cx="7.5" cy="15.5" r="5.5" />
                    </svg>
                    <div>
                      <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec] block">
                        Sign-in (Google / Zoho via Catalyst)
                      </span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">
                        Managed by Catalyst Authentication
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-neutral-100 dark:bg-[#262a33] text-gray-950 dark:text-white border border-[#ebebeb] dark:border-[#383d4a]">
                    Active
                  </span>
                </div>
                <div className="p-4 rounded-[20px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-5 h-5 stroke-[1.9] text-gray-950 dark:text-white shrink-0" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <div>
                      <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec] block">
                        Inactivity Auto-Lock Timeout (not enforced yet)
                      </span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">
                        Locks admin dashboard after idle period
                      </span>
                    </div>
                  </div>
                  <select className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#16191f] border border-neutral-300 dark:border-[#262a33] text-xs font-semibold focus:border-black dark:focus:border-white focus:outline-none transition-colors cursor-pointer text-gray-950 dark:text-white">
                    <option value="15m">
                      15 Minutes
                    </option>
                    <option value="30m">
                      30 Minutes
                    </option>
                    <option value="1h">
                      1 Hour
                    </option>
                    <option value="4h">
                      4 Hours
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
  ),
  telemetry: (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                Tactile & Audio Feedback
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-[20px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone w-5 h-5 stroke-[1.9] text-gray-950 dark:text-white shrink-0" aria-hidden="true">
                      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                      <path d="M12 18h.01" />
                    </svg>
                    <div>
                      <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec] block">
                        Tactile Vibration Feedback
                      </span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">
                        Vibrate motor on switches, buttons, and drawer triggers
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input className="sr-only peer" type="checkbox" />
                    <div className="w-[46px] h-7 bg-[#e5e7eb] dark:bg-[#2b303c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white dark:peer-checked:after:border-black after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white dark:after:bg-white dark:peer-checked:after:bg-black after:rounded-full after:h-[22px] after:w-[22px] after:shadow-sm after:transition-all peer-checked:bg-black dark:peer-checked:bg-white" />
                  </label>
                </div>
                <div className="p-4 rounded-[20px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume2 lucide-volume-2 w-5 h-5 stroke-[1.9] text-gray-950 dark:text-white shrink-0" aria-hidden="true">
                      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                      <path d="M16 9a5 5 0 0 1 0 6" />
                      <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
                    </svg>
                    <div>
                      <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec] block">
                        Acoustic Click Feedback
                      </span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">
                        Soft click sound on buttons
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input className="sr-only peer" type="checkbox" defaultChecked />
                    <div className="w-[46px] h-7 bg-[#e5e7eb] dark:bg-[#2b303c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white dark:peer-checked:after:border-black after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white dark:after:bg-white dark:peer-checked:after:bg-black after:rounded-full after:h-[22px] after:w-[22px] after:shadow-sm after:transition-all peer-checked:bg-black dark:peer-checked:bg-white" />
                  </label>
                </div>
              </div>
            </div>
            <div className="pt-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Real-Time Notification Subscriptions
              </h3>
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-[20px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-center justify-between shadow-xs">
                  <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec]">
                    Payment approval alerts
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input className="sr-only peer" type="checkbox" defaultChecked />
                    <div className="w-[46px] h-7 bg-[#e5e7eb] dark:bg-[#2b303c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white dark:peer-checked:after:border-black after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white dark:after:bg-white dark:peer-checked:after:bg-black after:rounded-full after:h-[22px] after:w-[22px] after:shadow-sm after:transition-all peer-checked:bg-black dark:peer-checked:bg-white" />
                  </label>
                </div>
                <div className="p-3.5 rounded-[20px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-center justify-between shadow-xs">
                  <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec]">
                    Audit log updates
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input className="sr-only peer" type="checkbox" defaultChecked />
                    <div className="w-[46px] h-7 bg-[#e5e7eb] dark:bg-[#2b303c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white dark:peer-checked:after:border-black after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white dark:after:bg-white dark:peer-checked:after:bg-black after:rounded-full after:h-[22px] after:w-[22px] after:shadow-sm after:transition-all peer-checked:bg-black dark:peer-checked:bg-white" />
                  </label>
                </div>
                <div className="p-3.5 rounded-[20px] bg-white dark:bg-[#1e232d] border border-[#ebebeb] dark:border-[#262a33] flex items-center justify-between shadow-xs">
                  <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec]">
                    Live refresh every 30 seconds
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input className="sr-only peer" type="checkbox" defaultChecked />
                    <div className="w-[46px] h-7 bg-[#e5e7eb] dark:bg-[#2b303c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white dark:peer-checked:after:border-black after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white dark:after:bg-white dark:peer-checked:after:bg-black after:rounded-full after:h-[22px] after:w-[22px] after:shadow-sm after:transition-all peer-checked:bg-black dark:peer-checked:bg-white" />
                  </label>
                </div>
              </div>
            </div>
          </div>
  ),
  };
  return (
    <div id="adminProfileModalOverlay" className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="fixed inset-0" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-[#f9f9f9] dark:bg-[#0d0f12] rounded-[28px] shadow-[0_16px_44px_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.06)] border border-[#ebebeb] dark:border-[#262a33] text-[#0d0d0d] dark:text-[#ececec] flex flex-col overflow-hidden" style={{ "opacity": "1", "transform": "none" }}>
        <header className="w-full pt-3 sm:pt-4 px-5 sm:px-6 pb-2.5 z-30 shrink-0 sticky top-0 relative flex flex-col gap-2.5" data-purpose="fixed-top-header">
          <div id="adminProfileTopbarSmokyFade" className="absolute inset-x-0 top-0 h-[116px] sm:h-[124px] pointer-events-none z-10 bg-gradient-to-b from-[#f9f9f9]/85 dark:from-[#0d0f12]/85 from-0% via-[#f9f9f9]/70 dark:via-[#0d0f12]/70 via-50% via-[#f9f9f9]/35 dark:via-[#0d0f12]/35 via-78% via-[#f9f9f9]/10 dark:via-[#0d0f12]/10 via-92% to-transparent backdrop-blur-[3px]" aria-hidden="true" style={{ "maskImage": "linear-gradient(rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.35) 78%, rgba(0, 0, 0, 0) 100%)" }} />
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white dark:bg-[#16191f] border border-[#ebebeb] dark:border-[#262a33] shadow-sm flex items-center justify-center text-gray-800 dark:text-[#ececec] font-bold text-sm shrink-0">
                A
              </div>
              <h1 className="relative z-20 text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
                Admin Profile
              </h1>
            </div>
            <button onClick={onClose} type="button" aria-label="Close profile screen" className="w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-[#16191f] border border-[#ebebeb] dark:border-[#262a33] shadow-sm text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1d24] active:scale-95 transition-all cursor-pointer shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-4 h-4 stroke-[2.25]" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <div className="relative z-20 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              id={`admin-profile-tab-${t.key}`}
              type="button"
              onClick={() => setTab(t.key)}
              className={tab === t.key ? ACTIVE_TAB : INACTIVE_TAB}
            >
              {t.label}
            </button>
          ))}
        </div>
        </header>
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 -mt-[96px] sm:-mt-[104px] pt-[108px] sm:pt-[116px] pb-6 space-y-6">
          {BODIES[tab]}
        </div>
        <div className="px-6 py-4 border-t border-[#ebebeb] dark:border-[#262a33] bg-[#f9f9f9] dark:bg-[#0d0f12] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={onSwitchToApp} className="px-4 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1e232d] dark:hover:bg-[#262a33] text-gray-950 dark:text-white border border-[#ebebeb] dark:border-[#262a33] text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-3.5 h-3.5" aria-hidden="true">
                <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                <path d="M20 2v4" />
                <path d="M22 4h-4" />
                <circle cx="4" cy="20" r="2" />
              </svg>
              <span>
                Switch to User App
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onLogout} className="px-4 py-2.5 rounded-full bg-neutral-100 hover:bg-red-50 hover:text-red-600 dark:bg-[#1e232d] dark:hover:bg-red-950/40 dark:hover:text-red-400 text-gray-950 dark:text-white border border-[#ebebeb] dark:border-[#262a33] text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out w-3.5 h-3.5" aria-hidden="true">
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              </svg>
              <span>
                Sign Out
              </span>
            </button>
            <button onClick={onClose} className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-xs">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
