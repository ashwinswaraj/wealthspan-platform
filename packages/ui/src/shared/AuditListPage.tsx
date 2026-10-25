import { ReactNode, useEffect, useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { cn } from "@jobrio/utils/utils";

/* ============================================================
 * AuditListPage — reusable, prop-driven list-page shell
 *
 * Section order (top → bottom), all mandatory:
 *  1. Title + description
 *  2. Search bar (optional, conditional — only renders when `search` prop is passed)
 *  3. Primary navigation bar (tabs)
 *  4. Sort / count row (merged filter+sort — single "Sort" control)
 *  5. List content area (children, empty state, loading skeleton)
 *
 * No internal business logic / routing / hardcoded data — everything is
 * driven by props from the parent page.
 * ============================================================ */

export type AuditListTab = {
  key: string;
  label: string;
  icon: string; // material-symbols-outlined glyph name
};

export type AuditSortOption = {
  key: string;
  label: string;
};

export interface AuditSearchConfig {
  query: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  /** "Investigate" toggle — omit to hide the button entirely */
  investigateActive?: boolean;
  onInvestigateToggle?: () => void;
  /** "Timeline" toggle — omit to hide the button entirely */
  timelineActive?: boolean;
  onTimelineToggle?: () => void;
}

export interface AuditListPageProps {
  title: string;
  description: string;
  /** Optional action rendered next to the title (e.g. a "Create New…" button). */
  headerAction?: ReactNode;
  tabs: AuditListTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  /** Options for the currently active tab. Leave empty/undefined for tabs with no sort/filter data (e.g. Dashboard). */
  sortOptions?: AuditSortOption[];
  sortValue?: string;
  onSortChange?: (key: string) => void;
  /** Live count for the currently selected sort/filter option on the active tab. */
  count: number;
  /** Only rendered when provided — some tabs (e.g. Dashboard) don't need a search bar. */
  search?: AuditSearchConfig;
  loading?: boolean;
  /**
   * Optional row-shaped skeleton to render while `loading` is true, instead
   * of the generic pulse bars. Pass a skeleton that mirrors the real rows
   * `children` renders (e.g. the same row component the caller uses), so
   * there's one skeleton per row-shape instead of a mismatched generic one.
   */
  loadingSkeleton?: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  children?: ReactNode;
  hideSortRow?: boolean;
}

const AEIconGlyph = ({ name, className }: { name: string; className?: string }) => (
  <span className={cn("material-symbols-outlined", className)} style={{ fontSize: 16 }}>
    {name}
  </span>
);

/* ---------- 2. Search bar — matches the existing collapsible search
   pattern (compact icon on the right at rest, expands leftward on tap),
   no background box behind it, only its own border. ---------- */
export const AuditSearchBar = ({ search }: { search: AuditSearchConfig }) => {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(search.query);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasActions = search.onInvestigateToggle || search.onTimelineToggle;

  useEffect(() => {
    setLocal(search.query);
  }, [search.query]);

  const handleChange = (v: string) => {
    setLocal(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search.onSearch(v), 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const expanded = open || !!local;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 min-w-0">
        <input
          type="text"
          value={local}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={
            search.placeholder ??
            "Search by User · Order ID · Assignment ID · Payment ID · Broadcast ID · Log ID · IP · Module…"
          }
          autoFocus={open}
          className={cn(
            "bg-transparent border border-outline-variant rounded-xl pl-3 pr-10 py-2.5 text-[11px] font-semibold text-on-surface placeholder:text-outline focus:outline-none transition-all duration-200 ease-out",
            expanded ? "w-full opacity-100" : "w-9 opacity-0 pointer-events-none",
          )}
          onBlur={() => {
            if (!local) setOpen(false);
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (local) {
              handleChange("");
              setOpen(false);
            } else {
              setOpen((v) => !v);
            }
          }}
          aria-label={local ? "Clear search" : "Toggle search"}
          className={cn(
            "absolute right-0 top-0 w-9 h-9 flex items-center justify-center text-on-surface hover:text-primary shrink-0",
            !expanded && "rounded-xl border border-outline-variant",
          )}
        >
          <SearchIcon size={16} />
        </button>
      </div>

      {hasActions && (
        <div
          className={cn(
            "flex items-center gap-2 transition-all duration-200 ease-out overflow-hidden",
            expanded ? "opacity-100 max-w-[220px]" : "opacity-0 max-w-0 pointer-events-none",
          )}
        >
          {search.onInvestigateToggle && (
            <button
              type="button"
              onClick={search.onInvestigateToggle}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors whitespace-nowrap",
                search.investigateActive
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface text-on-surface border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-low/60",
              )}
            >
              <AEIconGlyph name="tune" />
              Investigate
            </button>
          )}
          {search.onTimelineToggle && (
            <button
              type="button"
              onClick={search.onTimelineToggle}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors whitespace-nowrap",
                search.timelineActive
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface text-on-surface border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-low/60",
              )}
            >
              <AEIconGlyph name="timeline" />
              Timeline
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ---------- 4. Sort / count row — merged filter+sort, radio-button sheet ---------- */
const AuditSortRow = ({
  activeTabLabel,
  sortOptions,
  sortValue,
  onSortChange,
  count,
}: {
  activeTabLabel: string;
  sortOptions?: AuditSortOption[];
  sortValue?: string;
  onSortChange?: (key: string) => void;
  count: number;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasOptions = !!sortOptions && sortOptions.length > 0;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = hasOptions ? sortOptions!.find((o) => o.key === sortValue) : undefined;

  let leftLabel = hasOptions
    ? `${selected?.label ?? sortOptions![0].label} ${activeTabLabel} (${count})`
    : `${activeTabLabel} (0)`;

  if (activeTabLabel === "Abandoned Orders" && count === 0 && !hasOptions) {
    leftLabel = "";
  }

  return (
    <div className="flex items-center justify-between gap-3">
      {leftLabel && <p className="text-xs font-semibold text-on-surface-variant truncate">{leftLabel}</p>}

      {hasOptions && (
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
            <span>Sort</span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden z-30">
              <div className="px-4 py-3 border-b border-outline-variant/30">
                <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  Sort By
                </p>
              </div>
              <ul className="py-2 max-h-72 overflow-y-auto">
                {sortOptions!.map((o) => {
                  const on = o.key === sortValue;
                  return (
                    <li key={o.key}>
                      <button
                        type="button"
                        onClick={() => {
                          onSortChange?.(o.key);
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
                            "text-[12px] font-semibold",
                            on ? "text-primary" : "text-on-surface",
                          )}
                        >
                          {o.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ---------- 5. List content area ---------- */
const AuditListContent = ({
  loading,
  loadingSkeleton,
  isEmpty,
  emptyMessage,
  children,
}: {
  loading?: boolean;
  loadingSkeleton?: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  children?: ReactNode;
}) => {
  if (loading) {
    if (loadingSkeleton) return <>{loadingSkeleton}</>;
    // Fallback when no row-specific skeleton is supplied by the caller.
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded-xl bg-surface-container-low/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant/40 py-12 text-center">
        <p className="text-sm font-semibold text-on-surface-variant">
          {emptyMessage ?? "No records found."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

/* ---------- Root component ---------- */
export const AuditListPage = ({
  title,
  description,
  headerAction,
  tabs,
  activeTab,
  onTabChange,
  sortOptions,
  sortValue,
  onSortChange,
  count,
  search,
  loading,
  loadingSkeleton,
  emptyMessage,
  isEmpty,
  children,
  hideSortRow,
}: AuditListPageProps) => {
  const activeTabLabel = tabs.find((t) => t.key === activeTab)?.label ?? "";

  return (
    <div className="space-y-4">
      {/* 1. Title + description */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-extrabold text-on-surface">{title}</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
        </div>
        {headerAction}
      </div>

      {/* 2. Search bar — optional, conditional */}
      {search && <AuditSearchBar search={search} />}

      {/* 3. Primary navigation bar — all tabs, prop-driven */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const on = t.key === activeTab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onTabChange(t.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors",
                on
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface text-on-surface border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-low/60",
              )}
            >
              <AEIconGlyph name={t.icon} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Sort / count row */}
      {!hideSortRow && (
        <AuditSortRow
          activeTabLabel={activeTabLabel}
          sortOptions={sortOptions}
          sortValue={sortValue}
          onSortChange={onSortChange}
          count={count}
        />
      )}

      {/* 5. List content area */}
      <div className="min-w-0">
        <AuditListContent
          loading={loading}
          loadingSkeleton={loadingSkeleton}
          isEmpty={isEmpty}
          emptyMessage={emptyMessage}
        >
          {children}
        </AuditListContent>
      </div>
    </div>
  );
};

export default AuditListPage;
