import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@wealthspan/ui/design-system";
import { LoginScreen, useSession } from "@/features/wealthspan-auth";
import {
  HomeScreen,
  NotificationsSheet,
  SideDrawer,
  UpgradeScreen,
  useBroadcasts,
} from "@/features/wealthspan-shell";
import type { Project } from "@/features/projects";
import { SheetScreen, type SheetTarget } from "@/features/sheets";

export default function AppHome() {
  const session = useSession();
  const qc = useQueryClient();
  const [drawer, setDrawer] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [sheet, setSheet] = useState<SheetTarget | null>(null);
  const [inbox, setInbox] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const news = useBroadcasts();

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
        onUpgrade={() => setUpgrade(true)}
        onNotifications={() => setInbox(true)}
        hasUnread={news.hasUnread}
        onAsk={() => undefined}
        onVoice={() => undefined}
      />
      <SideDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        user={{ name: "Ashwin", subtitle: "Personal Finance & Wealth Tracker" }}
        activeProjectId={project?.id ?? null}
        onSelectProject={(p) => {
          setProject(p);
          setSheet({ kind: "project", project: p });
          setDrawer(false);
        }}
        onOpenSection={(key) => {
          setSheet({ kind: "section", key });
          setDrawer(false);
        }}
        onOpenSettings={() => undefined}
      />
      {inbox ? (
        <NotificationsSheet
          broadcasts={news.broadcasts}
          isUnread={news.isUnread}
          onMarkAllRead={news.markSeen}
          onClose={() => {
            news.markSeen();
            setInbox(false);
          }}
        />
      ) : null}
      {upgrade ? <UpgradeScreen onBack={() => setUpgrade(false)} /> : null}
      {sheet ? (
        <SheetScreen
          target={sheet}
          activeProject={project}
          onBack={() => setSheet(null)}
          onOpenAccounts={() => setSheet({ kind: "accounts" })}
        />
      ) : null}
    </>
  );
}
