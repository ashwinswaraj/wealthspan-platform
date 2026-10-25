import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Services";
import socialImage from "@/assets/services-social.jpg.asset.json";

const socialImageUrl = `https://mirror-job-quest.lovable.app${socialImage.url}`;

export const Route = createFileRoute("/services")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Workforce Services | Jobrio — Automated Execution Pipeline" },
      {
        name: "description",
        content:
          "Explore Jobrio's on-demand workforce services: vetted professionals, guaranteed outcomes, and a fully automated execution pipeline built for scale.",
      },
      {
        property: "og:title",
        content: "Workforce Services | Jobrio — Automated Execution Pipeline",
      },
      {
        property: "og:description",
        content:
          "On-demand workforce services with vetted professionals and guaranteed outcomes through Jobrio's automated pipeline.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/services" },
      { property: "og:image", content: socialImageUrl },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      {
        property: "og:image:alt",
        content: "A multidisciplinary Jobrio delivery team planning client work",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: socialImageUrl },
      {
        name: "twitter:image:alt",
        content: "A multidisciplinary Jobrio delivery team planning client work",
      },
    ],
    links: [{ rel: "canonical", href: "/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Jobrio Workforce Services",
          provider: { "@type": "Organization", name: "Jobrio" },
          serviceType: "Workforce-as-a-Service",
          description:
            "Automated workforce execution pipeline delivering guaranteed outcomes across professional service categories.",
        }),
      },
    ],
  }),
});
