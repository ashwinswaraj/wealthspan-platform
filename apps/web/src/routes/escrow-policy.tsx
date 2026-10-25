import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/legal";
export const Route = createFileRoute("/escrow-policy")({
  component: () => <LegalPage slug="escrow-policy" />,
  head: () => ({
    meta: [
      { title: "Escrow Policy | Jobrio" },
      { name: "description", content: "How Jobrio holds client payments in escrow and releases them after verified delivery." },
      { property: "og:title", content: "Escrow Policy | Jobrio" },
      { property: "og:description", content: "How Jobrio holds client payments in escrow and releases them after verified delivery." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/escrow-policy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/escrow-policy" }],
  }),
});
