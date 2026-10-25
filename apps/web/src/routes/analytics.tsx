import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Analytics";

export const Route = createFileRoute("/analytics")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Platform Analytics | Jobrio" },
      {
        name: "description",
        content:
          "Live analytics on Jobrio's automated workforce pipeline — throughput, quality tiers, on-time delivery, and outcome performance across categories.",
      },
      { property: "og:title", content: "Platform Analytics | Jobrio" },
      {
        property: "og:description",
        content:
          "Live workforce analytics: throughput, quality tiers, on-time delivery, and outcome performance across Jobrio's pipeline.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/analytics" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/analytics" }],
  }),
});
