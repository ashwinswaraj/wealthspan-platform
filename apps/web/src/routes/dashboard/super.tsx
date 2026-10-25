import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import Page from "@admin/pages/dashboard/admin/Dashboard";

/**
 * The admin console lives in `apps/admin`, but the demo launcher needs it
 * reachable from the platform app, so this route mounts the same page from
 * source (`@admin/*`) instead of duplicating it.
 */
function SuperAdminDashboardRoute() {
  const { pathname } = useLocation();
  return pathname.replace(/\/+$/, "") === "/dashboard/super" ? <Page role="super" /> : <Outlet />;
}

export const Route = createFileRoute("/dashboard/super")({
  component: SuperAdminDashboardRoute,
  head: () => ({
    meta: [
      { title: "Super Admin Dashboard | Jobrio" },
      {
        name: "description",
        content:
          "Monitor Jobrio operations, workforce activity, client orders, and platform administration.",
      },
      { property: "og:title", content: "Super Admin Dashboard | Jobrio" },
      {
        property: "og:description",
        content: "Monitor Jobrio operations, workforce activity, orders, and administration.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/dashboard/super" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "/dashboard/super" }],
  }),
});
