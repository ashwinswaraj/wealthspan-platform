import { useState } from "react";
import { ProjectsPanel, type Project } from "@/features/projects";
import { LEDGER_SECTIONS, type LedgerSectionKey } from "../lib/sections";
import { SectionIcon } from "./SectionIcon";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  user: { name: string; subtitle: string };
  activeProjectId: string | null;
  onSelectProject: (p: Project) => void;
  onOpenSection: (s: LedgerSectionKey) => void;
  onOpenSettings: () => void;
}

export function SideDrawer({
  open,
  onClose,
  user,
  activeProjectId,
  onSelectProject,
  onOpenSection,
  onOpenSettings,
}: SideDrawerProps) {
  const [hint, setHint] = useState<string | null>(null);
  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden select-none ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 cursor-pointer transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        aria-label="Navigation Drawer"
        className={`relative z-50 w-[80%] max-w-[344px] h-full bg-white dark:bg-[#171717] border-r border-transparent dark:border-[#262626] flex flex-col shadow-2xl overflow-hidden text-neutral-900 dark:text-[#ececec] touch-pan-y transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <header className="w-full pt-3 sm:pt-3.5 px-5 pb-2.5 flex items-center justify-between z-30 shrink-0 sticky top-0 relative select-none bg-transparent">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[72px] sm:h-[76px] pointer-events-none z-10 bg-gradient-to-b from-white/90 dark:from-[#171717]/90 from-0% via-white/70 dark:via-[#171717]/70 via-45% via-white/35 dark:via-[#171717]/35 via-72% via-white/10 dark:via-[#171717]/10 via-90% to-transparent"
            style={{
              maskImage:
                "linear-gradient(rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 45%, rgba(0, 0, 0, 0.35) 75%, rgba(0, 0, 0, 0) 100%)",
            }}
          />
          <div className="relative z-20 text-3xl font-extrabold tracking-tight text-black dark:text-white flex items-baseline select-text">
            <span>Wealth</span>
            <span className="font-normal text-gray-400 dark:text-neutral-500">span</span>
          </div>
          <div className="relative z-20 flex items-center">
            <button
              aria-label="Close navigation drawer"
              onClick={onClose}
              className="w-10 h-10 rounded-full border border-[#ebebeb] dark:border-[#2f2f2f] shadow-sm flex items-center justify-center text-gray-700 dark:text-[#ececec] hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2f2f2f] active:bg-gray-200 dark:active:bg-[#383838] focus:outline-none active:scale-95 transition-all duration-150 cursor-pointer bg-white dark:bg-[#212121]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar -mt-[56px] sm:-mt-[60px] pt-[66px] sm:pt-[70px] px-5 pb-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2 shrink-0">
            <div
              role="button"
              tabIndex={0}
              onClick={onOpenSettings}
              onKeyDown={(e) => e.key === "Enter" && onOpenSettings()}
              className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-200/80 dark:border-[#2f2f2f] shadow-sm cursor-pointer transition-all active:scale-[0.98] bg-white dark:bg-[#212121] hover:bg-neutral-50/60 dark:hover:bg-[#282828]"
            >
              <div className="w-14 h-14 rounded-full bg-black dark:bg-[#333333] flex items-center justify-center text-white text-lg font-bold tracking-wide shrink-0 shadow-sm overflow-hidden select-none">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <span className="text-lg font-bold text-neutral-900 dark:text-[#ececec] truncate">
                  {user.name}
                </span>
                <span
                  className="text-sm text-neutral-500 dark:text-neutral-400 truncate mt-0.5"
                  title={user.subtitle}
                >
                  {user.subtitle}
                </span>
              </div>
              <div className="text-neutral-400 dark:text-neutral-500 shrink-0 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>

          <ProjectsPanel onSelect={onSelectProject} />

          <nav
            aria-label="Main Actions"
            className="flex flex-col p-2.5 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-[#2f2f2f] shadow-sm shrink-0 divide-y divide-neutral-100 dark:divide-[#2b2b2b]"
          >
            {LEDGER_SECTIONS.map((s) => (
              <a
                key={s.key}
                href={`#${s.key}`}
                onClick={(e) => {
                  e.preventDefault();
                  setHint(null);
                  onOpenSection(s.key);
                }}
                className="flex items-center gap-3.5 py-3.5 px-3 text-neutral-900 dark:text-[#ececec] rounded-xl transition-all cursor-pointer active:scale-[0.98] hover:text-black dark:hover:text-white hover:bg-neutral-50/80 dark:hover:bg-[#282828]"
              >
                <SectionIcon section={s.key} />
                <span className="text-[16px] sm:text-[16.5px] font-medium tracking-tight">
                  {s.label}
                </span>
              </a>
            ))}
          </nav>
          {hint ? (
            <p role="status" className="px-1 text-xs text-neutral-500 dark:text-neutral-400">
              {hint}
            </p>
          ) : null}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800" />
        </div>
      </aside>
    </div>
  );
}
