import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/legal";
export const Route = createFileRoute("/sla")({
  component: () => <LegalPage slug="sla" />,
  head: () => ({
    meta: [
      { title: "Service Level Agreement | Jobrio" },
      { name: "description", content: "Jobrio's uptime, support response, payout and dispute service commitments." },
      { property: "og:title", content: "Service Level Agreement | Jobrio" },
      { property: "og:description", content: "Jobrio's uptime, support response, payout and dispute service commitments." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/sla" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/sla" }],
  }),
});
