import { useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCheck,
  CreditCard,
  MessageSquare,
  Package,
  Star,
} from "lucide-react";
import { cn } from "@jobrio/utils/utils";
import { EmptyState } from "@jobrio/ui/design-system";
import { SectionHeader, Card } from "@/components/dashboard/shared";
import {
  useNotificationRegistry,
  markNotificationRead,
  markAllNotificationsRead,
  type NotifType,
} from "@jobrio/constants";

const NOTIF_META: Record<NotifType, { icon: typeof Bell; tint: string; bg: string }> = {
  message: { icon: MessageSquare, tint: "text-primary-container", bg: "bg-primary-container/10" },
  order: { icon: Package, tint: "text-emerald-600", bg: "bg-emerald-500/10" },
  invoice: { icon: CreditCard, tint: "text-amber-600", bg: "bg-amber-500/10" },
  review: { icon: Star, tint: "text-orange-600", bg: "bg-orange-500/10" },
  system: { icon: AlertCircle, tint: "text-primary-container", bg: "bg-primary/10" },
};

export const NotificationsSection = () => {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const items = useNotificationRegistry();

  const visible = items.filter((n) =>
    filter === "all" ? true : filter === "unread" ? !n.read : n.read,
  );
  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => markAllNotificationsRead();
  const toggleRead = (id: string) => {
    const item = items.find((n) => n.id === id);
    if (item) markNotificationRead(id, !item.read);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notifications"
        action={
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-container hover:underline"
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        }
      />

      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "unread", "read"] as const).map((k) => {
          const active = filter === k;
          const count =
            k === "all" ? items.length : k === "unread" ? unreadCount : items.length - unreadCount;
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border",
                active
                  ? "bg-primary-container text-white border-primary-container"
                  : "bg-surface text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-low",
              )}
            >
              <span className="capitalize">{k}</span>
              <span
                className={cn(
                  "px-1.5 min-w-[20px] text-center rounded-full text-[10px]",
                  active ? "bg-white/20" : "bg-surface-container-high text-on-surface-variant",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Card>
        {visible.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications to show." />
        ) : (
          <ul className="divide-y divide-surface-container-high/60">
            {visible.map((n) => {
              const M = NOTIF_META[n.type];
              const Icon = M.icon;
              return (
                <li
                  key={n.id}
                  className={cn(
                    "py-4 px-2 flex items-start gap-4 rounded-xl transition-colors",
                    !n.read && "bg-primary/[0.03]",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      M.bg,
                    )}
                  >
                    <Icon size={18} className={M.tint} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-on-background truncate">
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-primary-container shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{n.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-outline">{n.time}</span>
                      <button
                        onClick={() => toggleRead(n.id)}
                        className="text-[11px] font-semibold text-primary-container hover:underline"
                      >
                        Mark as {n.read ? "unread" : "read"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};
