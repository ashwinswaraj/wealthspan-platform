import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/signup/professional/Step1Identity";
export const Route = createFileRoute("/signup/professional/step-1")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Professional Signup Identity | Jobrio" },
      {
        name: "description",
        content:
          "Start professional onboarding by entering identity details for your Jobrio account.",
      },
      { property: "og:title", content: "Professional Signup Identity | Jobrio" },
      {
        property: "og:description",
        content: "Start professional onboarding by entering identity details for Jobrio.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup/professional/step-1" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/signup/professional/step-1" }],
  }),
});
