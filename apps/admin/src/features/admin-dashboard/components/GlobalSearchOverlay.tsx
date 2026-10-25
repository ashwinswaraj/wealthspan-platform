import { useMemo } from "react";
import { Search, X } from "lucide-react";

import type { AdminSectionKey } from "./AdminDashboardLayout";
import { DIR_ALL_USERS } from "./usersDirectory";
import { useServiceRegistry, useOrderRegistry } from "@jobrio/constants";

export type SearchTarget =
  | { section: "users"; id: string }
  | { section: "services"; id: string }
  | { section: "orders"; id: string };

interface Props {
  query: string;
  onClose: () => void;
  onOpen: (target: SearchTarget) => void;
}

const SectionTitle = ({ title, count }: { title: string; count: number }) => (
  <div className="flex items-center gap-2 px-1 mb-2">
    <span className="text-[10px] font-bold uppercase tracking-wider text-outline">{title}</span>
    <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-1.5 rounded">
      {count}
    </span>
  </div>
);

const ActionCTA = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-90 shrink-0"
  >
    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
      {icon}
    </span>
    {label}
  </button>
);

const GlobalSearchOverlay = ({ query, onClose, onOpen }: Props) => {
  const q = query.trim().toLowerCase();
  const registry = useServiceRegistry();
  const orders = useOrderRegistry();

  const userResults = useMemo(() => {
    if (!q) return [];
    return DIR_ALL_USERS.filter((u) =>
      [u.id, u.name, u.email, u.phone, u.type, u.status].join(" ").toLowerCase().includes(q),
    ).slice(0, 25);
  }, [q]);

  const serviceResults = useMemo(() => {
    if (!q) return [];
    return registry
      .filter((s) =>
        `${s.id} ${s.title} ${s.category} ${s.subcategory} ${s.shortDesc} ${s.fullDesc}`
          .toLowerCase()
          .includes(q),
      )
      .map((s) => ({ id: s.id, name: s.title, category: s.category, subcategory: s.subcategory }))
      .slice(0, 25);
  }, [q, registry]);

  const orderResults = useMemo(() => {
    if (!q) return [];
    return orders
      .filter((o) => `${o.id} ${o.c} ${o.a} ${o.s}`.toLowerCase().includes(q))
      .slice(0, 25);
  }, [q, orders]);

  const total = userResults.length + serviceResults.length + orderResults.length;

  return (
    <div className="bg-surface rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col min-h-[70vh]">
      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-surface-container-high flex items-start gap-3 bg-surface">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Search className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
            Global Search
          </p>
          <p className="text-base font-extrabold text-on-surface truncate">Results for “{query}”</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            {total} match{total === 1 ? "" : "es"} across users, services & orders
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close search results"
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-on-surface-variant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {total === 0 && (
          <div className="text-center py-20 text-sm text-on-surface-variant">
            No matches across the platform.
          </div>
        )}

        {userResults.length > 0 && (
          <section>
            <SectionTitle title="Users" count={userResults.length} />
            <ul className="rounded-2xl border border-outline-variant/30 overflow-hidden divide-y divide-surface-container-high/60">
              {userResults.map((u) => (
                <li
                  key={u.id}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-surface-container-low/60"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {u.name
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{u.name}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      <span className="font-mono">{u.id}</span> · {u.type} · {u.email}
                    </p>
                  </div>
                  <ActionCTA
                    label="View Profile"
                    icon="visibility"
                    onClick={() => onOpen({ section: "users", id: u.id })}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {serviceResults.length > 0 && (
          <section>
            <SectionTitle title="Services" count={serviceResults.length} />
            <ul className="rounded-2xl border border-outline-variant/30 overflow-hidden divide-y divide-surface-container-high/60">
              {serviceResults.map((s) => (
                <li
                  key={s.id}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-surface-container-low/60"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm shrink-0">
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{s.name}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      <span className="font-mono">{s.id}</span> · {s.category} · {s.subcategory}
                    </p>
                  </div>
                  <ActionCTA
                    label="View Details"
                    icon="visibility"
                    onClick={() => onOpen({ section: "services", id: s.id })}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {orderResults.length > 0 && (
          <section>
            <SectionTitle title="Orders" count={orderResults.length} />
            <ul className="rounded-2xl border border-outline-variant/30 overflow-hidden divide-y divide-surface-container-high/60">
              {orderResults.map((o) => (
                <li
                  key={o.id}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-surface-container-low/60"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      assignment
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">#{o.id}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {o.c} · {o.a} · {o.when}
                    </p>
                  </div>
                  <ActionCTA
                    label="View Order"
                    icon="visibility"
                    onClick={() => onOpen({ section: "orders", id: o.id })}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default GlobalSearchOverlay;

// Helper so AdminDashboard knows which section to switch to.
export const targetSectionKey = (t: SearchTarget): AdminSectionKey => {
  if (t.section === "users") return "users";
  if (t.section === "services") return "services";
  return "orders";
};
