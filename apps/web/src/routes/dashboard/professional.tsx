import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/dashboard/professional/ActiveDashboard";
export const Route = createFileRoute("/dashboard/professional")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Professional Dashboard | Jobrio" },
      {
        name: "description",
        content:
          "Track Jobrio professional assignments, performance, payments, and account activity.",
      },
      { property: "og:title", content: "Professional Dashboard | Jobrio" },
      {
        property: "og:description",
        content: "Track Jobrio assignments, performance, payments, and activity.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/dashboard/professional" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/dashboard/professional" }],
  }),
});
