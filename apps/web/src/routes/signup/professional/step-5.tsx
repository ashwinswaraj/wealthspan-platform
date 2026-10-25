import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/signup/professional/Step5IdVerification";
export const Route = createFileRoute("/signup/professional/step-5")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Professional ID Verification | Jobrio" },
      {
        name: "description",
        content: "Complete identity verification to finish Jobrio professional onboarding.",
      },
      { property: "og:title", content: "Professional ID Verification | Jobrio" },
      {
        property: "og:description",
        content: "Complete identity verification to finish professional onboarding.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup/professional/step-5" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/signup/professional/step-5" }],
  }),
});
