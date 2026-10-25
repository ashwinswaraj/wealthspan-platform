import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/signup/professional/Step4Capacity";
export const Route = createFileRoute("/signup/professional/step-4")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Professional Capacity | Jobrio" },
      {
        name: "description",
        content:
          "Set capacity, availability, and service preferences for your Jobrio professional account.",
      },
      { property: "og:title", content: "Professional Capacity | Jobrio" },
      {
        property: "og:description",
        content: "Set capacity and availability for Jobrio professional onboarding.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup/professional/step-4" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/signup/professional/step-4" }],
  }),
});
