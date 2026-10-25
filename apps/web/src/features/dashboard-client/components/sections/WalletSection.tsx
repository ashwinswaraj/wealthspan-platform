import { Filter } from "lucide-react";
import { cn } from "@jobrio/utils/utils";
import { SectionHeader, Card } from "@/components/dashboard/shared";
import { useOrderRegistry } from "@jobrio/constants";

const ESCROW_HOLDING_STATUSES = new Set([
  "payment_received",
  "assigned",
  "progress",
  "qa",
  "delivered",
  "awaiting_approval",
  "rework",
  "disputed",
]);
const SPENT_STATUSES = new Set([
  "payment_received",
  "assigned",
  "progress",
  "qa",
  "delivered",
  "awaiting_approval",
  "rework",
  "disputed",
  "released",
  "resolved",
]);
const COMPLETED_STATUSES = new Set(["released", "resolved"]);

const parseAmount = (s?: string) => Number((s ?? "").replace(/[^0-9.]/g, "")) || 0;
const fmt = (n: number) => `₹${n.toLocaleString()}`;

export const WalletSection = () => {
  const orders = useOrderRegistry();

  const escrowBalance = orders
    .filter((o) => ESCROW_HOLDING_STATUSES.has(o.s))
    .reduce((sum, o) => sum + parseAmount(o.a), 0);
  const totalSpent = orders
    .filter((o) => SPENT_STATUSES.has(o.s))
    .reduce((sum, o) => sum + parseAmount(o.a), 0);
  const completedValue = orders
    .filter((o) => COMPLETED_STATUSES.has(o.s))
    .reduce((sum, o) => sum + parseAmount(o.a), 0);
  const walletBalance = orders
    .filter((o) => o.s === "cancelled" && o.refundAmount)
    .reduce((sum, o) => sum + parseAmount(o.refundAmount), 0);

  const cards = [
    { label: "Escrow balance", value: fmt(escrowBalance), accent: "text-amber-600" },
    { label: "Available wallet", value: fmt(walletBalance), accent: "text-emerald-600" },
    { label: "Total spent", value: fmt(totalSpent), accent: "text-primary-container" },
    { label: "Completed value", value: fmt(completedValue), accent: "text-violet-600" },
  ];

  const transactions = [
    ...orders
      .filter((o) => ESCROW_HOLDING_STATUSES.has(o.s))
      .map((o) => ({
        label: `Escrow held — #${o.id}`,
        amount: `-${o.a}`,
        when: o.invoiceDate ?? o.when,
      })),
    ...orders
      .filter((o) => o.s === "cancelled" && o.refundAmount)
      .map((o) => ({
        label: `Refund — #${o.id}`,
        amount: `+${o.refundAmount}`,
        when: o.rejectedAt ? new Date(o.rejectedAt).toLocaleDateString() : o.when,
      })),
  ].slice(0, 8);

  return (
    <div className="space-y-6">
      <SectionHeader title="Wallet" subtitle="Your money, organized." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-3xl p-5 bg-surface-container-low border border-outline-variant/30"
          >
            <div className="text-xs font-semibold text-outline">{c.label}</div>
            <div className={cn("text-2xl font-extrabold mt-1", c.accent)}>{c.value}</div>
          </div>
        ))}
      </div>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-on-background">Recent transactions</h3>
          <span
            aria-disabled="true"
            title="Transaction filters are not available in this build"
            className="text-xs font-semibold text-outline/60 inline-flex items-center gap-1 cursor-not-allowed"
          >
            <Filter size={12} /> Filters · Coming soon
          </span>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-surface-container-high/60">
            {transactions.map((t) => (
              <li key={t.label} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-on-background">{t.label}</div>
                  <div className="text-xs text-on-surface-variant">{t.when}</div>
                </div>
                <div
                  className={cn(
                    "text-sm font-bold",
                    t.amount.startsWith("+") ? "text-emerald-600" : "text-on-background",
                  )}
                >
                  {t.amount}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
