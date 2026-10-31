import { createFileRoute } from "@tanstack/react-router";
import Page from "@admin/pages/dashboard/admin/Dashboard";

// "/admin/" on Catalyst hosting (static hosting has no deep-link fallback, so the console lives at the root).
export const Route = createFileRoute("/")({
  component: Page,
  head: () => ({ meta: [{ title: "Admin | Wealthspan" }, { name: "robots", content: "noindex, nofollow" }] }),
});
