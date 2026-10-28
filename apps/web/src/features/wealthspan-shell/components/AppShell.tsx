import type { ReactNode } from "react";
import { cn } from "@jobrio/utils/utils";
import { SECTIONS, type SectionKey } from "../lib/sections";

/** Phone-first frame: content on top, 5-tab bar at the bottom. */
export function AppShell({
  active,
  onChange,
  children,
}: {
  active: SectionKey;
  onChange: (k: SectionKey) => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface text-on-surface">
      <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-28">{children}</main>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur"
      >
        <ul className="mx-auto flex max-w-2xl justify-between px-2 pb-[env(safe-area-inset-bottom)]">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <li key={key} className="flex-1">
              <button
                type="button"
                aria-current={active === key ? "page" : undefined}
                onClick={() => onChange(key)}
                className={cn(
                  "flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                  active === key ? "text-on-surface" : "text-outline",
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={active === key ? 2.2 : 1.6} />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
