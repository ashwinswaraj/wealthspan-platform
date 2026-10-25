import { cn } from "@jobrio/utils/utils";
import { useOrderRegistry } from "@jobrio/constants";

const MetricCard = ({
  icon,
  iconCls,
  iconFilled,
  label,
  value,
}: {
  icon: string;
  iconCls: string;
  iconFilled?: boolean;
  label: string;
  value: string;
}) => (
  <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-3xl flex flex-col justify-between min-h-[160px]">
    <div>
      <span
        className={cn("material-symbols-outlined mb-4 block", iconCls)}
        style={iconFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      <p className="text-outline text-sm">{label}</p>
    </div>
    <h2 className="font-headline text-2xl font-extrabold text-on-surface">{value}</h2>
  </div>
);

type ActionDef =
  | { label: string; primary: true; onClick?: () => void }
  | {
      label: string;
      variant: "outline" | "soft" | "muted" | "link";
      onClick?: () => void;
    };

const ActivityItem = ({
  badge,
  meta,
  title,
  desc,
  descNode,
  thumb,
  action,
  actions,
}: {
  badge: { text: string; cls: string };
  meta: string;
  title: string;
  desc?: string;
  descNode?: React.ReactNode;
  thumb: { kind: "icon"; icon: string; bg: string };
  action?: { label: string; primary: true; onClick?: () => void };
  actions?: ActionDef[];
}) => {
  const list: ActionDef[] = action ? [action] : actions || [];
  return (
    <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:bg-surface-container/40 rounded-2xl transition-colors">
      <div
        className={cn(
          "w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0",
          thumb.bg,
        )}
      >
        <span className="material-symbols-outlined text-3xl">{thumb.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight",
              badge.cls,
            )}
          >
            {badge.text}
          </span>
          <span className="text-xs text-outline">{meta}</span>
        </div>
        <h3 className="text-sm font-semibold text-on-surface truncate">{title}</h3>
        <p className="text-xs text-outline mt-0.5">{descNode || desc}</p>
      </div>
      <div className="flex gap-2 sm:flex-shrink-0">
        {list.map((a) => {
          if ("primary" in a) {
            return (
              <button
                key={a.label}
                onClick={a.onClick}
                className="px-6 py-2 rounded-full bg-primary-container text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                {a.label}
              </button>
            );
          }
          if (a.variant === "link") {
            return (
              <button
                key={a.label}
                onClick={a.onClick}
                className="text-sm font-semibold text-primary-container hover:underline inline-flex items-center gap-1"
              >
                {a.label}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            );
          }
          const variantCls =
            a.variant === "outline"
              ? "border border-outline-variant text-on-surface hover:bg-surface-container-low"
              : a.variant === "soft"
                ? "bg-surface-container-low text-primary-container hover:bg-primary-container hover:text-white"
                : "bg-surface-container-low text-on-surface hover:bg-surface-container";
          return (
            <button
              key={a.label}
              onClick={a.onClick}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                variantCls,
              )}
            >
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const HomeSection = ({
  name: _name,
  onNavigate,
}: {
  name: string;
  onNavigate?: (key: "create-order" | "orders" | "invoices" | "messages") => void;
}) => {
  const orders = useOrderRegistry();
  const parseAmount = (s?: string) => Number((s ?? "").replace(/[^0-9.]/g, "")) || 0;
  const holding = new Set([
    "payment_received",
    "assigned",
    "progress",
    "qa",
    "delivered",
    "awaiting_approval",
    "rework",
    "disputed",
  ]);
  const spent = new Set([...holding, "released", "resolved"]);
  const escrowBalance = orders
    .filter((o) => holding.has(o.s))
    .reduce((s, o) => s + parseAmount(o.a), 0);
  const totalSpent = orders.filter((o) => spent.has(o.s)).reduce((s, o) => s + parseAmount(o.a), 0);
  const available = orders
    .filter((o) => o.s === "cancelled" && o.refundAmount)
    .reduce((s, o) => s + parseAmount(o.refundAmount), 0);
  const fmt = (n: number) => `₹${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard
          icon="inventory_2"
          iconCls="text-primary-container"
          label="Total Orders"
          value={String(orders.length)}
        />
        <MetricCard
          icon="lock"
          iconCls="text-amber-500"
          iconFilled
          label="Escrow Balance"
          value={fmt(escrowBalance)}
        />
        <MetricCard
          icon="account_balance_wallet"
          iconCls="text-emerald-500"
          iconFilled
          label="Available"
          value={fmt(available)}
        />
        <MetricCard
          icon="trending_up"
          iconCls="text-primary-container"
          label="Total Spent"
          value={fmt(totalSpent)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-surface-container-low rounded-3xl border border-outline-variant/30 overflow-hidden">
          <div className="px-8 pt-8 pb-4 flex justify-between items-center">
            <h3 className="text-xl font-extrabold font-headline text-slate-900">Recent Activity</h3>
            <button
              type="button"
              onClick={() => onNavigate?.("orders")}
              className="text-sm font-semibold text-primary-container hover:underline"
            >
              View All History
            </button>
          </div>
          <div className="divide-y divide-outline-variant/20 px-2">
            <ActivityItem
              badge={{ text: "New Message", cls: "bg-primary/10 text-primary" }}
              meta="Just now"
              title="CreativeFlow Studio sent a message"
              desc={'"I\u2019ve uploaded the initial wireframes for the homepage..."'}
              thumb={{ kind: "icon", icon: "chat", bg: "bg-primary/10 text-primary" }}
              action={{
                label: "Reply",
                primary: true,
                onClick: () => onNavigate?.("messages"),
              }}
            />
            <ActivityItem
              badge={{ text: "Active", cls: "bg-primary-container/10 text-primary-container" }}
              meta="#JB-90210"
              title="Modern SaaS Platform UI/UX Redesign"
              descNode={
                <>
                  Assigned to:{" "}
                  <span className="font-semibold text-on-surface">CreativeFlow Studio</span>
                </>
              }
              thumb={{
                kind: "icon",
                icon: "design_services",
                bg: "bg-surface-container text-primary-container",
              }}
              actions={[
                { label: "Track", variant: "outline", onClick: () => onNavigate?.("orders") },
                { label: "Reply", primary: true, onClick: () => onNavigate?.("messages") },
              ]}
            />
            <ActivityItem
              badge={{ text: "Completed", cls: "bg-emerald-500/10 text-emerald-600" }}
              meta="#JB-72199"
              title="Enterprise SEO Audit & Strategy"
              descNode={
                <>
                  Assigned to: <span className="font-semibold text-on-surface">GrowthKings</span>
                </>
              }
              thumb={{
                kind: "icon",
                icon: "trending_up",
                bg: "bg-surface-container text-primary-container",
              }}
              actions={[
                {
                  label: "View Details",
                  variant: "outline",
                  onClick: () => onNavigate?.("orders"),
                },
              ]}
            />
            <ActivityItem
              badge={{ text: "Invoice", cls: "bg-amber-500/10 text-amber-600" }}
              meta="#INV-2024-042"
              title="New Invoice for Modern SaaS Platform"
              descNode={
                <>
                  Amount: <span className="font-semibold text-on-surface">₹2,400.00</span> • Due in
                  5 days
                </>
              }
              thumb={{
                kind: "icon",
                icon: "description",
                bg: "bg-surface-container-low text-primary-container",
              }}
              action={{ label: "Pay Now", primary: true, onClick: () => onNavigate?.("invoices") }}
            />
            <ActivityItem
              badge={{ text: "Revision Requested", cls: "bg-orange-500/10 text-orange-600" }}
              meta="#JB-88421"
              title="E-commerce App Prototyping"
              descNode={
                <>
                  Status:{" "}
                  <span className="font-semibold text-on-surface">Waiting for professional</span>
                </>
              }
              thumb={{
                kind: "icon",
                icon: "phone_iphone",
                bg: "bg-surface-container text-primary-container",
              }}
              actions={[
                {
                  label: "View Message",
                  variant: "outline",
                  onClick: () => onNavigate?.("messages"),
                },
              ]}
            />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30">
            <h3 className="font-headline text-lg font-extrabold text-on-surface mb-2">
              Need something new?
            </h3>
            <p className="text-sm text-outline mb-6">
              Describe your project requirements and start receiving offers from verified
              professionals within minutes.
            </p>
            <button
              onClick={() => onNavigate?.("create-order")}
              className="w-full py-4 rounded-xl bg-primary-container text-white font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add_circle
              </span>
              Create New Order
            </button>
          </div>

          <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30">
            <h4 className="text-sm font-semibold text-on-surface mb-4">Your Account Manager</h4>
            <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9vhTcCQikB8T9MsVGe1s3gVWD9KajbL_sKAMf2G44mAv_M4U8OM9X7hdDb4116_PKxpM5KYW9s6PaxuTMGlhIJxspLNkfqnMfZ_K2gh_kN-4V62M_5cITr0emrfvKYim2NC_lPMuPQTIlhQS4TXf9TYhNitfBSqsZXtk-OvKZs8QrW7ZYqwg9ow3WA_kn7AuGPhnf4DjVDwxlae7pAsBw0_8gSZ8gdA8lc7aqep5TymfPBf6TG4_bmqL_U4fBHFUl7k9OJ5-lckCB"
                alt="Sarah Chen"
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">Sarah Chen</p>
                <p className="text-xs text-outline truncate">Online &amp; ready to help</p>
              </div>
              <button
                onClick={() => onNavigate?.("messages")}
                className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-primary-container hover:bg-white transition-colors shrink-0"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  chat_bubble
                </span>
              </button>
            </div>
          </div>

          <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-primary-container shrink-0">
                verified_user
              </span>
              <div>
                <p className="text-sm font-semibold text-on-surface">Secure Transactions</p>
                <p className="text-xs text-outline mt-1">
                  All payments are held in escrow and only released when you approve the delivery.
                </p>
                <p className="text-[11px] text-outline/80 mt-3 pt-3 border-t border-outline-variant/30">
                  <strong className="text-on-surface">Verified Professionals:</strong> Every expert
                  on Jobrio undergoes a rigorous identity and skill verification process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
