import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import Page from "@admin/pages/dashboard/admin/Dashboard";

function AdminDashboardRoute() {
  const { pathname } = useLocation();
  return pathname.replace(/\/+$/, "") === "/dashboard/admin" ? <Page role="super" /> : <Outlet />;
}

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminDashboardRoute,
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Jobrio" },
      {
        name: "description",
        content:
          "Monitor Jobrio operations, workforce activity, client orders, and platform administration.",
      },
      { property: "og:title", content: "Admin Dashboard | Jobrio" },
      {
        property: "og:description",
        content: "Monitor Jobrio operations, workforce activity, orders, and administration.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/dashboard/admin" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "/dashboard/admin" }],
  }),
});
