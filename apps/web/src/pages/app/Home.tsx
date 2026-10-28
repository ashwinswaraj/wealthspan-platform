import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState, Spinner } from "@jobrio/ui/design-system";
import { Hammer } from "lucide-react";
import { LoginScreen, useSession } from "@/features/wealthspan-auth";
import { AppShell, SECTIONS, type SectionKey } from "@/features/wealthspan-shell";
import { ProjectsScreen } from "@/features/projects";

export default function AppHome() {
  return (
    <div className="wealthspan-theme">
      <AppHomeInner />
    </div>
  );
}

function AppHomeInner() {
  const session = useSession();
  const qc = useQueryClient();
  const [active, setActive] = useState<SectionKey>("projects");

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
      <div className="min-h-dvh grid place-items-center p-6">
        <EmptyState
          title="Can't reach Wealthspan"
          description="Check your internet and try again."
          actionLabel="Retry"
          onAction={() => session.refetch()}
        />
      </div>
    );

  return (
    <AppShell active={active} onChange={setActive}>
      {active === "projects" ? (
        <ProjectsScreen />
      ) : (
        <EmptyState
          icon={Hammer}
          title={`${SECTIONS.find((s) => s.key === active)?.label} is coming next`}
          description="This screen is being built."
        />
      )}
    </AppShell>
  );
}
