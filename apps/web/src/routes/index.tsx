import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Index";

const siteUrl = "https://mirror-job-quest.lovable.app/";
const socialImageUrl =
  "https://mirror-job-quest.lovable.app/__l5e/assets-v1/2a14f962-fb8d-4ca8-8a99-20a8a9d64aaf/jobrio-hero-social.jpg";

export const Route = createFileRoute("/")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Jobrio | Workforce-as-a-Service" },
      {
        name: "description",
        content:
          "The end of bidding. The start of execution. Jobrio delivers guaranteed outcomes through an automated professional workforce pipeline.",
      },
      { property: "og:title", content: "Jobrio | Workforce-as-a-Service" },
      {
        property: "og:description",
        content:
          "Skip searching, vetting, and bidding. Jobrio's automated workforce pipeline delivers guaranteed outcomes on demand.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { property: "og:image", content: socialImageUrl },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Jobrio modern office workspace" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: socialImageUrl },
      { name: "twitter:image:alt", content: "Jobrio modern office workspace" },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
  }),
});
