import { useEffect, useRef, useState } from "react";
import { cn } from "@jobrio/utils/utils";

/**
 * SortDropdown — canonical "Sort" control extracted from AuditListPage.
 *
 * Used to replace secondary tab rows across sections (QA Desk,
 * Finance & Escrow, Dispute Center) so each section shows exactly ONE
 * primary navigation row on top, and — for the currently active view —
 * a single "Sort" pill that reveals a radio-style option sheet.
 *
 * The count label on the left mirrors the selected option and the number
 * of rows currently shown for that option.
 */

export type SortOption<K extends string = string> = {
  key: K;
  label: string;
  count?: number;
};

interface SortDropdownProps<K extends string = string> {
  options: SortOption<K>[];
  value: K;
  onChange: (key: K) => void;
  /** Right-hand pill label. Defaults to "Sort". */
  buttonLabel?: string;
  /** Left-hand summary label suffix (e.g. "Records"). */
  itemsNoun?: string;
  className?: string;
}

const AEIconGlyph = ({ name, className }: { name: string; className?: string }) => (
  <span className={cn("material-symbols-outlined", className)} style={{ fontSize: 16 }}>
    {name}
  </span>
);

export function SortDropdown<K extends string = string>({
  options,
  value,
  onChange,
  buttonLabel = "Sort",
  itemsNoun,
  className,
}: SortDropdownProps<K>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = options.find((o) => o.key === value) ?? options[0];
  const count = selected?.count;

  const leftLabel = selected
    ? `${selected.label}${itemsNoun ? ` ${itemsNoun}` : ""}${
        typeof count === "number" ? ` (${count})` : ""
      }`
    : "";

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <p className="text-xs font-semibold text-on-surface-variant truncate">{leftLabel}</p>

      <div className="relative shrink-0" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors whitespace-nowrap",
            open
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface text-on-surface border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-low/60",
          )}
        >
          <AEIconGlyph name="sort" />
          <span>{buttonLabel}</span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-64 bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden z-30">
            <div className="px-4 py-3 border-b border-outline-variant/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Sort By</p>
            </div>
            <ul className="py-2 max-h-72 overflow-y-auto">
              {options.map((o) => {
                const on = o.key === value;
                return (
                  <li key={o.key}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(o.key);
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-container/60"
                    >
                      <span
                        className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                          on ? "border-primary" : "border-outline-variant/60",
                        )}
                      >
                        {on && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </span>
                      <span
                        className={cn(
                          "flex-1 text-[12px] font-semibold",
                          on ? "text-primary" : "text-on-surface",
                        )}
                      >
                        {o.label}
                      </span>
                      {typeof o.count === "number" && (
                        <span className="text-[11px] font-semibold text-outline">{o.count}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default SortDropdown;
