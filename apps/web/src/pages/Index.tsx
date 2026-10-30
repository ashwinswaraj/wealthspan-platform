import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@jobrio/ui/design-system";
import { LoginScreen, useSession } from "@/features/wealthspan-auth";
import { HomeScreen, SideDrawer } from "@/features/wealthspan-shell";
import type { Project } from "@/features/projects";

export default function AppHome() {
  const session = useSession();
  const qc = useQueryClient();
  const [drawer, setDrawer] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  if (session.status === "loading")
    return (
      <div className="min-h-dvh grid place-items-center">
        <Spinner />
      </div>
    );
  if (session.status === "out")
    return <LoginScreen onLoggedIn={() => qc.invalidateQueries({ queryKey: ["session"] })} />;
  if (session.status === "error")
    return (
      <div className="min-h-dvh grid place-items-center p-6 text-center">
        <p className="text-neutral-600">
          Can't reach Wealthspan. Check your internet and{" "}
          <button className="underline" onClick={() => session.refetch()}>
            try again
          </button>
          .
        </p>
      </div>
    );

  return (
    <>
      <HomeScreen
        displayName="there"
        onOpenMenu={() => setDrawer(true)}
        onUpgrade={() => undefined}
        onNotifications={() => undefined}
        onAsk={() => undefined}
        onVoice={() => undefined}
      />
      <SideDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        user={{ name: "Ashwin", subtitle: "Personal Finance & Wealth Tracker" }}
        activeProjectId={project?.id ?? null}
        onSelectProject={setProject}
        onOpenSection={() => setDrawer(false)}
        onOpenSettings={() => undefined}
      />
    </>
  );
}
