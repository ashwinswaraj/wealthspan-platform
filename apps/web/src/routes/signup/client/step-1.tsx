import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/signup/client/Step1Identity";
export const Route = createFileRoute("/signup/client/step-1")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Client Signup Identity | Jobrio" },
      {
        name: "description",
        content: "Start client onboarding by entering identity details for your Jobrio account.",
      },
      { property: "og:title", content: "Client Signup Identity | Jobrio" },
      {
        property: "og:description",
        content: "Start client onboarding by entering identity details for Jobrio.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup/client/step-1" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/signup/client/step-1" }],
  }),
});
