import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/dashboard/professional/Dashboard";
export const Route = createFileRoute("/dashboard/trial")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Trial Dashboard | Jobrio" },
      {
        name: "description",
        content:
          "Preview Jobrio professional dashboard activity, assignments, and workforce metrics.",
      },
      { property: "og:title", content: "Trial Dashboard | Jobrio" },
      {
        property: "og:description",
        content: "Preview Jobrio dashboard activity, assignments, and workforce metrics.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/dashboard/trial" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/dashboard/trial" }],
  }),
});
