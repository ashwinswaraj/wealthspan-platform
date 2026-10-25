import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/signup/client/Step2Verification";
export const Route = createFileRoute("/signup/client/step-2")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Client Signup Verification | Jobrio" },
      {
        name: "description",
        content: "Verify your client contact details to continue Jobrio account onboarding.",
      },
      { property: "og:title", content: "Client Signup Verification | Jobrio" },
      {
        property: "og:description",
        content: "Verify your client contact details to continue Jobrio onboarding.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup/client/step-2" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/signup/client/step-2" }],
  }),
});
