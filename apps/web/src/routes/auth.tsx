import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@/lib/react-router-dom";
import { DemoLauncher } from "@/features/auth";
import { SignIn, SignUp } from "@jobrio/auth";

type AuthSearch = { mode?: "signin" | "signup" };

/** Single auth surface: /auth (sign in) and /auth?mode=signup (sign up). */
function AuthPage() {
  const navigate = useNavigate();
  const { mode } = Route.useSearch();
  return mode === "signup" ? (
    <SignUp navigate={navigate} demoLauncher={<DemoLauncher />} />
  ) : (
    <SignIn navigate={navigate} demoLauncher={<DemoLauncher />} />
  );
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search.mode === "signup" ? "signup" : "signin",
  }),
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign In or Join | Jobrio" },
      {
        name: "description",
        content:
          "Access your Jobrio account or create one to manage orders, assignments and the workforce execution pipeline.",
      },
      { property: "og:title", content: "Sign In or Join | Jobrio" },
      {
        property: "og:description",
        content: "Access your Jobrio account or create one in a single auth flow.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/auth" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
});
