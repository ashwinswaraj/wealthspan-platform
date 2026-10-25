import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/legal";
export const Route = createFileRoute("/terms-of-service")({
  component: () => <LegalPage slug="terms-of-service" />,
  head: () => ({
    meta: [
      { title: "Terms of Service | Jobrio" },
      { name: "description", content: "The terms that govern using Jobrio as a client or professional." },
      { property: "og:title", content: "Terms of Service | Jobrio" },
      { property: "og:description", content: "The terms that govern using Jobrio as a client or professional." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/terms-of-service" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/terms-of-service" }],
  }),
});
