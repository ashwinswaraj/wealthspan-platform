import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/legal";
export const Route = createFileRoute("/privacy-policy")({
  component: () => <LegalPage slug="privacy-policy" />,
  head: () => ({
    meta: [
      { title: "Privacy Policy | Jobrio" },
      { name: "description", content: "What data Jobrio collects, how it is used and shared, and your privacy rights." },
      { property: "og:title", content: "Privacy Policy | Jobrio" },
      { property: "og:description", content: "What data Jobrio collects, how it is used and shared, and your privacy rights." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/privacy-policy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/privacy-policy" }],
  }),
});
