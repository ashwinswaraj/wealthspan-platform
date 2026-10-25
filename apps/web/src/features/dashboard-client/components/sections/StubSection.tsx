import { useNavigate } from "@tanstack/react-router";
import { SectionHeader, Card } from "@/components/dashboard/shared";

const SAMPLES: Record<
  string,
  { kpis: { l: string; v: string }[]; rows: { l: string; v: string }[] }
> = {
  Analytics: {
    kpis: [
      { l: "GMV (30d)", v: "₹48.2L" },
      { l: "Orders", v: "1,284" },
      { l: "Active Pros", v: "612" },
      { l: "Avg Fill", v: "94%" },
    ],
    rows: [
      { l: "Top category", v: "Design (32%)" },
      { l: "Demand-supply gap", v: "Dev: +18 needed" },
      { l: "Revenue MoM", v: "+12.4%" },
      { l: "Avg order value", v: "₹3,756" },
    ],
  },
  Security: {
    kpis: [
      { l: "Threats blocked", v: "47" },
      { l: "Failed logins (24h)", v: "128" },
      { l: "Suspicious devices", v: "9" },
      { l: "2FA adoption", v: "82%" },
    ],
    rows: [
      { l: "Risk event · IP 49.205.x", v: "Auto-blocked" },
      { l: "New device · Pro #P-204", v: "Verification sent" },
      { l: "Brute force · client portal", v: "Mitigated" },
      { l: "Geo anomaly · Admin login", v: "Reviewed" },
    ],
  },
  Policies: {
    kpis: [
      { l: "Policies", v: "12" },
      { l: "Last update", v: "Today" },
      { l: "Compliance", v: "100%" },
      { l: "Acceptance", v: "98.4%" },
    ],
    rows: [
      { l: "Terms of Service", v: "v3.2" },
      { l: "Privacy Policy", v: "v2.4" },
      { l: "Client Rules", v: "v1.8" },
      { l: "Professional Rules", v: "v2.1" },
    ],
  },
  System: {
    kpis: [
      { l: "Uptime", v: "99.98%" },
      { l: "Queue depth", v: "42" },
      { l: "Integrations", v: "9 healthy" },
      { l: "Incidents (7d)", v: "0" },
    ],
    rows: [
      { l: "API gateway", v: "Healthy" },
      { l: "Payments · Razorpay", v: "Connected" },
      { l: "KYC · Digio", v: "Connected" },
      { l: "Background jobs", v: "Processing 42" },
    ],
  },
  Settings: {
    kpis: [
      { l: "Profile", v: "Complete" },
      { l: "2FA", v: "Enabled" },
      { l: "Sessions", v: "3 active" },
      { l: "Plan", v: "Pro" },
    ],
    rows: [
      { l: "Email", v: "user@jobrio.in" },
      { l: "Phone", v: "+91 98xxxx7421" },
      { l: "Language", v: "English (IN)" },
      { l: "Time zone", v: "Asia/Kolkata" },
    ],
  },
  Feedback: {
    kpis: [
      { l: "Submitted", v: "18" },
      { l: "In review", v: "4" },
      { l: "Shipped", v: "9" },
      { l: "CSAT", v: "4.7 / 5" },
    ],
    rows: [
      { l: "Wallet UX", v: "Under review" },
      { l: "Faster QA cycle", v: "Shipped" },
      { l: "Mobile sidebar", v: "Planned" },
      { l: "Invoice export PDF", v: "Shipped" },
    ],
  },
  Support: {
    kpis: [
      { l: "Open tickets", v: "2" },
      { l: "Avg response", v: "32m" },
      { l: "Resolved (30d)", v: "27" },
      { l: "Priority", v: "Standard" },
    ],
    rows: [
      { l: "Ticket #SR-4021", v: "Awaiting reply" },
      { l: "Ticket #SR-4014", v: "Resolved" },
      { l: "KB article", v: "Escrow holds" },
      { l: "Contact", v: "support@jobrio.in" },
    ],
  },
  "Terms of Service": {
    kpis: [
      { l: "Version", v: "v3.2" },
      { l: "Effective", v: "01 Apr 2026" },
      { l: "Jurisdiction", v: "India" },
      { l: "Length", v: "12 sections" },
    ],
    rows: [
      { l: "Account", v: "Sec. 2" },
      { l: "Payments", v: "Sec. 5" },
      { l: "Disputes", v: "Sec. 8" },
      { l: "Termination", v: "Sec. 11" },
    ],
  },
  FAQ: {
    kpis: [
      { l: "Articles", v: "84" },
      { l: "Top read", v: "Escrow" },
      { l: "Categories", v: "9" },
      { l: "Updated", v: "Today" },
    ],
    rows: [
      { l: "How does escrow work?", v: "5 min read" },
      { l: "How are pros assigned?", v: "3 min read" },
      { l: "Refund policy", v: "4 min read" },
      { l: "Pricing model", v: "6 min read" },
    ],
  },
  Oops: {
    kpis: [
      { l: "Status", v: "Operational" },
      { l: "Incidents (7d)", v: "0" },
      { l: "Uptime", v: "99.98%" },
      { l: "Region", v: "ap-south-1" },
    ],
    rows: [
      { l: "API", v: "Healthy" },
      { l: "Payments", v: "Healthy" },
      { l: "Messaging", v: "Healthy" },
      { l: "Storage", v: "Healthy" },
    ],
  },
  "Privacy Policy": {
    kpis: [
      { l: "Version", v: "v2.4" },
      { l: "Effective", v: "01 Apr 2026" },
      { l: "Data retention", v: "24 mo" },
      { l: "DPO", v: "privacy@jobrio.in" },
    ],
    rows: [
      { l: "Data collected", v: "Profile, KYC, usage" },
      { l: "Cookies", v: "Essential + analytics" },
      { l: "Sharing", v: "Payment & KYC only" },
      { l: "Your rights", v: "Access · Delete · Export" },
    ],
  },
  "Service Level Agreement": {
    kpis: [
      { l: "Uptime", v: "99.95%" },
      { l: "Support SLA", v: "1h critical" },
      { l: "Payout SLA", v: "T+2 days" },
      { l: "Dispute SLA", v: "5 days" },
    ],
    rows: [
      { l: "Severity 1", v: "1h response" },
      { l: "Severity 2", v: "4h response" },
      { l: "Severity 3", v: "1 business day" },
      { l: "Maintenance window", v: "Sun 02:00 IST" },
    ],
  },
  "Refund & Cancellation": {
    kpis: [
      { l: "Refunds (30d)", v: "12" },
      { l: "Avg approval", v: "2 days" },
      { l: "Auto-refund cap", v: "₹5,000" },
      { l: "Success rate", v: "94%" },
    ],
    rows: [
      { l: "Cancel before pickup", v: "100% refund" },
      { l: "Cancel mid-execution", v: "Pro-rata" },
      { l: "QA rejection", v: "Full refund" },
      { l: "Wallet top-ups", v: "Non-refundable" },
    ],
  },
  "About Jobrio": {
    kpis: [
      { l: "Founded", v: "2024" },
      { l: "HQ", v: "Bengaluru, IN" },
      { l: "Pros", v: "12,400+" },
      { l: "Orders shipped", v: "48,200+" },
    ],
    rows: [
      { l: "Model", v: "Workforce-as-a-Service" },
      { l: "Industries", v: "Design · Dev · Ops" },
      { l: "Funding", v: "Series A" },
      { l: "Team", v: "62 people" },
    ],
  },
};

export const StubSection = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const data = SAMPLES[title] ?? {
    kpis: [
      { l: "Status", v: "Active" },
      { l: "Items", v: "12" },
      { l: "Updated", v: "Today" },
      { l: "Owner", v: "Jobrio" },
    ],
    rows: [
      { l: "Overview", v: "Available" },
      { l: "Details", v: "Configured" },
      { l: "History", v: "Tracked" },
      { l: "Support", v: "24×7" },
    ],
  };
  const navigate = useNavigate();
  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    navigate({ to: "/login" });
  };
  return (
    <div className="space-y-6">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.kpis.map((k) => (
          <Card key={k.l}>
            <p className="text-[11px] uppercase tracking-wider text-outline font-bold">{k.l}</p>
            <p className="text-xl font-extrabold font-headline text-on-surface mt-1">{k.v}</p>
          </Card>
        ))}
      </div>
      <Card>
        <ul className="divide-y divide-outline-variant/30">
          {data.rows.map((r) => (
            <li key={r.l} className="flex items-center justify-between py-3 text-sm">
              <span className="text-on-surface-variant">{r.l}</span>
              <span className="font-semibold text-on-surface">{r.v}</span>
            </li>
          ))}
        </ul>
      </Card>
      {title === "Settings" && (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface">Sign out</p>
              <p className="text-xs text-outline mt-0.5">
                You will be returned to the login screen.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                logout
              </span>
              Logout
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};
