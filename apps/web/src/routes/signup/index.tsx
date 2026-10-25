import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Signup";
export const Route = createFileRoute("/signup/")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Join Jobrio | Client or Professional Signup" },
      {
        name: "description",
        content:
          "Choose how to join Jobrio: create your first order or apply as a vetted professional.",
      },
      { property: "og:title", content: "Join Jobrio | Client or Professional Signup" },
      {
        property: "og:description",
        content: "Choose a client or professional path and start your Jobrio onboarding.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/signup" }],
  }),
});
