import { useEffect, useState } from "react";
import { SectionHeader, Card } from "@/components/dashboard/shared";
import { cn } from "@jobrio/utils/utils";
import { toast } from "sonner";
import { useNavigate } from "@/lib/react-router-dom";
import { loadSignup } from "@jobrio/auth/signupStorage";
import {
  exportAccountData,
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  type AccountSettings,
} from "../../lib/account-settings";
import { settingsGroups, type SettingsRole } from "./settings/schema";
import { SettingsDetail } from "./settings/SettingsDetail";

export type { SettingsRole };

export const SettingsSection = ({
  role,
  onOpenProfile,
}: {
  role: SettingsRole;
  onOpenProfile: () => void;
}) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AccountSettings>(DEFAULT_SETTINGS);
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    setSettings(loadSettings(role));
    setOpenKey(null);
  }, [role]);

  const persist = (next: AccountSettings) => {
    setSettings(next);
    saveSettings(role, next);
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    navigate("/login");
  };

  const groups = settingsGroups(role);
  const openItem = openKey ? groups.flatMap((g) => g.items).find((i) => i.key === openKey) : null;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        subtitle={
          role === "client"
            ? "Manage your client account preferences."
            : "Manage your professional account preferences."
        }
        action={
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open profile"
            title="Profile"
            className="w-10 h-10 rounded-full border border-outline-variant/40 hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center justify-center text-on-surface-variant shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              account_circle
            </span>
          </button>
        }
      />

      {openItem ? (
        <SettingsDetail
          item={openItem}
          settings={settings}
          onSave={persist}
          onBack={() => setOpenKey(null)}
          onExport={() => {
            exportAccountData(role, loadSignup(role));
            toast.success("Your data file has been downloaded.");
          }}
          onDelete={() => {
            toast.success("Account deleted.");
            handleLogout();
          }}
        />
      ) : (
        groups.map((g) => (
          <Card key={g.title} className="p-0 overflow-hidden">
            <p className="px-5 pt-4 pb-2 text-[11px] uppercase tracking-wider text-outline font-bold">
              {g.title}
            </p>
            <ul className="divide-y divide-outline-variant/30">
              {g.items.map((it) => {
                const value = it.value?.(settings);
                return (
                  <li key={it.key}>
                    <button
                      type="button"
                      onClick={() =>
                        it.custom === "profile" ? onOpenProfile() : setOpenKey(it.key)
                      }
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-primary/5",
                        it.custom === "delete" && "hover:bg-destructive/5",
                      )}
                    >
                      <span
                        className={cn(
                          "w-9 h-9 rounded-2xl bg-surface-container flex items-center justify-center shrink-0",
                          it.custom === "delete" ? "text-destructive" : "text-on-surface-variant",
                        )}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          {it.icon}
                        </span>
                      </span>
                      <span className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "block text-sm font-semibold truncate",
                            it.custom === "delete" ? "text-destructive" : "text-on-surface",
                          )}
                        >
                          {it.label}
                        </span>
                        <span className="block text-xs text-on-surface-variant truncate">
                          {it.desc}
                        </span>
                      </span>
                      {value && (
                        <span className="hidden sm:block text-xs font-semibold text-on-surface-variant shrink-0 capitalize">
                          {value}
                        </span>
                      )}
                      <span
                        className="material-symbols-outlined text-outline shrink-0"
                        style={{ fontSize: 16 }}
                      >
                        arrow_forward_ios
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))
      )}

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface">Sign out</p>
            <p className="text-xs text-outline mt-0.5">You will be returned to the login screen.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              logout
            </span>
            Logout
          </button>
        </div>
      </Card>
    </div>
  );
};
