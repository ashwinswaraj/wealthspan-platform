import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/signup/professional/Step2Verification";
export const Route = createFileRoute("/signup/professional/step-2")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Professional Verification | Jobrio" },
      {
        name: "description",
        content: "Verify your contact details to continue Jobrio professional onboarding.",
      },
      { property: "og:title", content: "Professional Verification | Jobrio" },
      {
        property: "og:description",
        content: "Verify your contact details to continue professional onboarding.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup/professional/step-2" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/signup/professional/step-2" }],
  }),
});
