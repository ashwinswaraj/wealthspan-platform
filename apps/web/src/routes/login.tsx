import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Login";

export const Route = createFileRoute("/login")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Sign In | Jobrio" },
      {
        name: "description",
        content:
          "Sign in to your Jobrio account to manage orders, track assignments, and access the workforce execution pipeline.",
      },
      { property: "og:title", content: "Sign In | Jobrio" },
      {
        property: "og:description",
        content: "Sign in to Jobrio to manage orders and access the workforce execution pipeline.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/login" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
});
