import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/legal";
export const Route = createFileRoute("/dispute-resolution")({
  component: () => <LegalPage slug="dispute-resolution" />,
  head: () => ({
    meta: [
      { title: "Dispute Resolution Policy | Jobrio" },
      { name: "description", content: "How Jobrio reviews evidence and resolves disputes between clients and professionals." },
      { property: "og:title", content: "Dispute Resolution Policy | Jobrio" },
      { property: "og:description", content: "How Jobrio reviews evidence and resolves disputes between clients and professionals." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/dispute-resolution" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/dispute-resolution" }],
  }),
});
