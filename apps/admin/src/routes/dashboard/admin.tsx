import { createFileRoute } from "@tanstack/react-router";
import Page from "@admin/pages/dashboard/admin/Dashboard";

export const Route = createFileRoute("/dashboard/admin")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Admin | Wealthspan" },
      {
        name: "description",
        content:
          "Wealthspan admin console: users, subscription payments, ledger and system health.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&display=swap",
      },
    ],
  }),
});
