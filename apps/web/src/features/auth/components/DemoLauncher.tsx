import { useNavigate } from "@/lib/react-router-dom";

const demos = [
  { label: "Super Admin", to: "/dashboard/super", icon: "shield_person" },
  { label: "Client", to: "/dashboard/client", icon: "business_center" },
  { label: "Pro (Trial)", to: "/dashboard/trial", icon: "task_alt" },
  { label: "Professional", to: "/dashboard/professional", icon: "engineering" },
];

export const DemoLauncher = () => {
  const navigate = useNavigate();
  return (
    <div className="mt-6 pt-6 border-t border-outline-variant/30">
      <p className="text-center text-[11px] font-bold uppercase tracking-wider text-outline mb-3">
        Launch demo dashboard
      </p>
      <div className="grid grid-cols-2 gap-2">
        {demos.map((d) => (
          <button
            key={d.to}
            type="button"
            onClick={() => navigate(d.to)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low hover:bg-primary/10 hover:border-primary text-on-surface text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">{d.icon}</span>
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DemoLauncher;
