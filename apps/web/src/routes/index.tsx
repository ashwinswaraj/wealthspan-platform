import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Index";
export const Route = createFileRoute("/")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Wealthspan" },
      { name: "description", content: "Your personal AI accountant — the full arc of your money." },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&display=swap",
      },
    ],
  }),
});
