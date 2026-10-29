import type { LedgerSectionKey } from "../lib/sections";

const cls = "w-6 h-6 stroke-[2] stroke-neutral-900 dark:stroke-[#ececec] fill-none shrink-0";
const round = { strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function SectionIcon({ section }: { section: LedgerSectionKey }) {
  switch (section) {
    case "income":
      return (
        <svg className={cls} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" {...round} />
          <path d="M15 9l-6 6M9 9v6h6" {...round} />
        </svg>
      );
    case "expense":
      return (
        <svg className={cls} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" {...round} />
          <path d="M9 15l6-6M9 9h6v6" {...round} />
        </svg>
      );
    case "debt-loan":
      return (
        <svg className={cls} viewBox="0 0 24 24">
          <rect height="16" rx="2.5" width="18" x="3" y="4" {...round} />
          <line x1="3" x2="21" y1="9" y2="9" {...round} />
          <line x1="16.5" x2="7.5" y1="13" y2="18" {...round} />
          <circle cx="9" cy="14" fill="currentColor" r="0.8" />
          <circle cx="15" cy="17" fill="currentColor" r="0.8" />
        </svg>
      );
    case "savings-investing":
      return (
        <svg className={cls} viewBox="0 0 24 24">
          <path d="M3 19h18" {...round} />
          <path d="M4 14l4.5-4.5 4 4L20 6" {...round} />
          <path d="M15 6h5v5" {...round} />
        </svg>
      );
    case "festivals-functions":
      return (
        <svg className={cls} viewBox="0 0 24 24">
          <path d="M12 2.5l1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5 1.5-5z" {...round} />
          <path d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" {...round} />
          <path d="M5 16.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4z" {...round} />
        </svg>
      );
  }
}
