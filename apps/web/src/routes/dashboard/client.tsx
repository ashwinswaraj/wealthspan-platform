import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/dashboard/client/Dashboard";
export const Route = createFileRoute("/dashboard/client")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Client Dashboard | Jobrio" },
      {
        name: "description",
        content:
          "Manage Jobrio client orders, deliverables, workforce assignments, and account activity.",
      },
      { property: "og:title", content: "Client Dashboard | Jobrio" },
      {
        property: "og:description",
        content: "Manage Jobrio client orders, deliverables, and account activity.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/dashboard/client" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/dashboard/client" }],
  }),
});
