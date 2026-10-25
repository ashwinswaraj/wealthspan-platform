import { createFileRoute } from "@tanstack/react-router";
import Page from "@admin/pages/dashboard/admin/Dashboard";

export const Route = createFileRoute("/dashboard/super/sub")({
  component: () => <Page role="sub" />,
  head: () => ({
    meta: [
      { title: "Sub Admin Dashboard | Jobrio" },
      {
        name: "description",
        content: "Sub-admin view of Jobrio operations, orders, and workforce activity.",
      },
      { property: "og:title", content: "Sub Admin Dashboard | Jobrio" },
      {
        property: "og:description",
        content: "Sub-admin view of Jobrio operations, orders, and workforce activity.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/dashboard/super/sub" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "/dashboard/super/sub" }],
  }),
});
