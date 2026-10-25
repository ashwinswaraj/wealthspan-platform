import { Link } from "@tanstack/react-router";

const CONTENT: Record<string, { title: string; intro: string; points: string[] }> = {
  "privacy-policy": {
    title: "Privacy Policy",
    intro: "How Jobrio handles account, order, payment and operational data.",
    points: [
      "We collect only information required to provide and secure Jobrio services.",
      "Access to operational data is role-controlled and audited.",
      "Payment credentials are handled by the configured payment provider; Jobrio does not expose sensitive payment data in the dashboard.",
    ],
  },
  "terms-of-service": {
    title: "Terms of Service",
    intro: "The rules governing use of Jobrio by clients and professionals.",
    points: [
      "Clients submit accurate requirements and use Jobrio for legitimate business work.",
      "Professionals must complete verification and follow assignment, quality and communication rules.",
      "Jobrio may restrict accounts for fraud, abuse, policy violations or operational risk.",
    ],
  },
  "refund-cancellation": {
    title: "Refund & Cancellation",
    intro: "How cancellation and refunds are handled across an order lifecycle.",
    points: [
      "Before professional assignment, an eligible cancellation can receive a full refund.",
      "After assignment, cancellation is reviewed against the order state and applicable dispute rules.",
      "Refund outcomes are recorded against the order and payment ledger.",
    ],
  },
  sla: {
    title: "Service Level Agreement",
    intro: "Service expectations for managed execution on Jobrio.",
    points: [
      "Delivery timelines depend on the selected service, requirements and assignment state.",
      "Quality review is performed before eligible deliverables are released to the client.",
      "Exceptions and delays are surfaced through the operational workflow rather than hidden from the client.",
    ],
  },
  "escrow-policy": {
    title: "Escrow Policy",
    intro: "How Jobrio protects funds during managed execution.",
    points: [
      "Client funds remain protected while an order is being executed under the Jobrio workflow.",
      "Release depends on the applicable delivery, approval and dispute state.",
      "Ledger events are tied to the order lifecycle for auditability.",
    ],
  },
  "dispute-resolution": {
    title: "Dispute Resolution",
    intro: "How order disputes are reviewed and resolved.",
    points: [
      "Disputes are linked to the affected order and its evidence.",
      "Operational, QA and financial records are reviewed before a final decision.",
      "Resolved outcomes are recorded and reflected in the order and financial state.",
    ],
  },
};

export default function LegalPage({ slug }: { slug: string }) {
  const data = CONTENT[slug] ?? CONTENT["terms-of-service"];
  return (
    <main className="min-h-screen bg-surface text-on-surface px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-primary-container font-semibold hover:underline">
          ← Back to Jobrio
        </Link>
        <div className="mt-10 bg-surface-container-low border border-outline-variant/30 rounded-3xl p-8 md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-container">
            Jobrio Legal
          </p>
          <h1 className="mt-3 text-4xl font-extrabold font-headline">{data.title}</h1>
          <p className="mt-4 text-on-surface-variant leading-relaxed">{data.intro}</p>
          <div className="mt-8 space-y-4">
            {data.points.map((point) => (
              <p
                key={point}
                className="rounded-2xl bg-surface p-5 border border-outline-variant/20 leading-relaxed"
              >
                {point}
              </p>
            ))}
          </div>
          <p className="mt-8 text-xs text-outline">
            This product build contains the operational baseline for these policies. Final legal
            text should be reviewed and approved before public launch.
          </p>
        </div>
      </div>
    </main>
  );
}
