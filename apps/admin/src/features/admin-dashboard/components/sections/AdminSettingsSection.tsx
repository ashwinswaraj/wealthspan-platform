import { SectionHeader, Card } from "../sections/shared";
import { cn } from "@jobrio/utils/utils";
import { useNavigate } from "@admin/lib/react-router-dom";

interface Props {
  showLive: boolean;
  onToggleLive: (v: boolean) => void;
}

const Toggle = ({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <div className="min-w-0">
      <p className="text-sm font-bold text-on-surface">{label}</p>
      {hint && <p className="text-xs text-on-surface-variant mt-0.5">{hint}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-outline-variant/60",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  </div>
);

const AdminSettingsSection = ({ showLive, onToggleLive }: Props) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    navigate("/login");
  };
  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Manage workspace preferences." />
      <Card>
        <p className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2">
          Workspace
        </p>
        <Toggle
          checked={showLive}
          onChange={onToggleLive}
          label="Enable Screen 2"
          hint="Show the live workspace pane (right side) with real-time queues and alerts."
        />
      </Card>
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

export default AdminSettingsSection;
