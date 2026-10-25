import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/legal";
export const Route = createFileRoute("/refund-cancellation")({
  component: () => <LegalPage slug="refund-cancellation" />,
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy | Jobrio" },
      { name: "description", content: "When Jobrio orders can be cancelled and how refunds are calculated and paid." },
      { property: "og:title", content: "Refund & Cancellation Policy | Jobrio" },
      { property: "og:description", content: "When Jobrio orders can be cancelled and how refunds are calculated and paid." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/refund-cancellation" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/refund-cancellation" }],
  }),
});
