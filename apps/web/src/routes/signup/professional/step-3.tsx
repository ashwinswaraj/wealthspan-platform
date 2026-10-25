import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/signup/professional/Step3Details";
export const Route = createFileRoute("/signup/professional/step-3")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Professional Details | Jobrio" },
      {
        name: "description",
        content: "Add your professional profile details for Jobrio workforce onboarding.",
      },
      { property: "og:title", content: "Professional Details | Jobrio" },
      {
        property: "og:description",
        content: "Add professional profile details for Jobrio workforce onboarding.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup/professional/step-3" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/signup/professional/step-3" }],
  }),
});
