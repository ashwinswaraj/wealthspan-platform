import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/signup/Intent";
export const Route = createFileRoute("/signup/intent")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Choose Signup Path | Jobrio" },
      {
        name: "description",
        content:
          "Select whether you want to create orders as a client or apply to work as a Jobrio professional.",
      },
      { property: "og:title", content: "Choose Signup Path | Jobrio" },
      {
        property: "og:description",
        content: "Pick a client or professional onboarding path for your Jobrio account.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup/intent" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/signup/intent" }],
  }),
});
