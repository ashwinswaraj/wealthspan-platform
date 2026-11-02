import { useMemo, useState, type FormEvent } from "react";
import { useAdminOverview, useAdminUsers } from "../lib/adminApi";
import type { AdminUserRow, PlanTier } from "../lib/types";

const NOT_AVAILABLE = "Not available yet";

const num = (n: number | null | undefined) =>
  typeof n === "number" ? n.toLocaleString("en-IN") : "—";

const initialsOf = (u: AdminUserRow) => {
  const src = (u.name || u.email || "").trim();
  if (!src) return "?";
  const parts = src.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : src.slice(0, 2);
  return letters.toUpperCase();
};

/** Spreadsheet apps run cells that start with = + - @ as formulas; neutralise them. */
const csvCell = (v: string) => {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};

function downloadCsv(rows: AdminUserRow[]) {
  const head = [
    "Name",
    "Email",
    "Wealthspan ID",
    "Role",
    "Plan",
    "Plan validity",
    "Active since",
    "Status",
  ];
  const lines = [
    head.map(csvCell).join(","),
    ...rows.map((u) =>
      [u.name, u.email, u.code, u.role, u.plan, u.planValidity, u.activeSince, u.status]
        .map((c) => csvCell(String(c ?? "")))
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wealthspan-users.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const SPARKLES = (cls: string) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cls}
    aria-hidden="true"
  >
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
    <path d="M20 2v4" />
    <path d="M22 4h-4" />
    <circle cx="4" cy="20" r="2" />
  </svg>
);

const ZAP = (cls: string) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cls}
    aria-hidden="true"
  >
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);

function PlanPill({ plan }: { plan: PlanTier }) {
  if (plan === "Pro") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs">
        {SPARKLES("lucide lucide-sparkles w-3 h-3")}
        <span>Wealthspan Pro</span>
      </span>
    );
  }
  if (plan === "Go") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800 shadow-xs">
        {ZAP("lucide lucide-zap w-3 h-3")}
        <span>Wealthspan Go</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-[#262a33] dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
      <span>Free Tier</span>
    </span>
  );
}

function StatusPill({ status }: { status: AdminUserRow["status"] }) {
  const tone =
    status === "Active"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
      : status === "Suspended"
        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tone}`}
    >
      {status}
    </span>
  );
}

function UserRowView({
  user,
  menuOpen,
  onToggle,
}: {
  user: AdminUserRow;
  menuOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <tr className="hover:bg-[#f5f5f5]/80 dark:hover:bg-[#383838]/40 transition-colors cursor-pointer group user-row">
      <td className="py-4 px-5 align-middle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] shadow-xs">
            {initialsOf(user)}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[#0d0d0d] dark:text-white truncate">
                {user.name || user.email || "—"}
              </span>
              {user.isSuperAdmin && (
                <span title="Verified Super Administrator">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-circle-check w-3.5 h-3.5 text-blue-500"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#737373] dark:text-[#b4b4b4]">
              {user.role || "—"}
            </span>
          </div>
        </div>
      </td>
      <td className="py-4 px-5 align-middle text-neutral-600 dark:text-neutral-300">
        <span className="truncate block max-w-[200px]">{user.email || "—"}</span>
      </td>
      <td className="py-4 px-5 align-middle font-mono">
        <span className="px-2.5 py-1 rounded font-mono text-[11px] bg-[#f0f0f0] dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] border border-[#ebebeb] dark:border-[#383838]">
          {user.code || "—"}
        </span>
      </td>
      <td className="py-4 px-5 align-middle">
        <PlanPill plan={user.plan} />
      </td>
      <td className="py-4 px-5 align-middle">
        <div className="flex flex-col">
          <span className="font-semibold text-[#0d0d0d] dark:text-white text-xs">
            {user.planValidity || "—"}
          </span>
          <span className="text-[11px] text-[#737373] dark:text-[#b4b4b4]">
            Active since {user.activeSince || "—"}
          </span>
        </div>
      </td>
      <td className="py-4 px-5 align-middle text-center">
        <StatusPill status={user.status} />
      </td>
      <td className="py-4 px-5 align-middle text-right">
        <div className="relative inline-block text-left">
          <button
            type="button"
            aria-label="User actions"
            onClick={onToggle}
            className="p-2 rounded-xl text-[#737373] dark:text-[#b4b4b4] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#383838] transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-ellipsis-vertical w-4 h-4"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
          {menuOpen && (
            <div
              role="status"
              className="absolute right-0 top-full mt-1 z-20 whitespace-nowrap px-3 py-2 rounded-xl text-[11px] font-medium bg-white dark:bg-[#212121] text-[#737373] dark:text-[#b4b4b4] border border-[#ebebeb] dark:border-[#383838] shadow-md"
            >
              Edit / suspend: {NOT_AVAILABLE}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function StatCard({
  title,
  icon,
  value,
  valueClass,
  sub,
  subDot,
}: {
  title: string;
  icon: React.ReactNode;
  value: string;
  valueClass: string;
  sub: string;
  subDot?: boolean;
}) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#2f2f2f] border border-[#ebebeb] dark:border-[#383838] shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between text-[#737373] dark:text-[#b4b4b4]">
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <div className="mt-3">
        <span className={`text-2xl font-bold tracking-tight ${valueClass}`}>{value}</span>
        <div className="flex items-center gap-1.5 mt-1">
          {subDot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          <span className="text-xs text-[#737373] dark:text-[#b4b4b4]">{sub}</span>
        </div>
      </div>
    </div>
  );
}

function AddUserModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("Free");
  const [role, setRole] = useState("user");
  const [notice, setNotice] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setNotice(true); // no create-user endpoint exists: never fake a success
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#16191f] rounded-[28px] p-6 shadow-2xl flex flex-col gap-4 border border-[#ebebeb] dark:border-[#262a33] text-[#0d0d0d] dark:text-[#ececec]"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#ebebeb] dark:border-[#262a33]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user-plus w-5 h-5 stroke-[1.9]"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#0d0d0d] dark:text-[#ececec]">
                Add New App User
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                User Profile & Plan Provisioning
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#ebebeb] dark:border-[#262a33] text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#252a35] active:scale-95 transition-all cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x w-4 h-4"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <form className="space-y-4 pt-1" onSubmit={submit}>
          <div className="relative w-full">
            {!name && (
              <label
                htmlFor="modal-provision-name"
                className="absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none left-11 top-1/2 -translate-y-1/2 px-0 text-sm font-normal text-[#737373] dark:text-[#b4b4b4] bg-transparent"
              >
                Full User Name
              </label>
            )}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373] dark:text-[#b4b4b4] pointer-events-none z-10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user w-4 h-4"
                aria-hidden="true"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              id="modal-provision-name"
              placeholder=""
              className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl pl-11 pr-5 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border border-[#ebebeb] dark:border-[#383838]"
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="relative w-full">
            {!email && (
              <label
                htmlFor="modal-provision-email"
                className="absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none left-11 top-1/2 -translate-y-1/2 px-0 text-sm font-normal text-[#737373] dark:text-[#b4b4b4] bg-transparent"
              >
                Registered Email Address
              </label>
            )}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373] dark:text-[#b4b4b4] pointer-events-none z-10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-mail w-4 h-4"
                aria-hidden="true"
              >
                <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                <rect x="2" y="4" width="20" height="16" rx="2" />
              </svg>
            </div>
            <input
              id="modal-provision-email"
              placeholder=""
              className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl pl-11 pr-5 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border border-[#ebebeb] dark:border-[#383838]"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative w-full">
              <label
                htmlFor="modal-provision-plan"
                className="-top-2.5 left-4 px-1.5 text-xs font-semibold bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] rounded-sm absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none"
              >
                Initial Plan
              </label>
              <select
                id="modal-provision-plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl px-4 pr-11 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-[#ebebeb] dark:border-[#383838]"
              >
                <option value="Free">Free Tier</option>
                <option value="Wealthspan Pro">Wealthspan Pro</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373] dark:text-[#b4b4b4]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-down w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
            <div className="relative w-full">
              <label
                htmlFor="modal-provision-role"
                className="-top-2.5 left-4 px-1.5 text-xs font-semibold bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] rounded-sm absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none"
              >
                Account Role
              </label>
              <select
                id="modal-provision-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl px-4 pr-11 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-[#ebebeb] dark:border-[#383838]"
              >
                <option value="user">Standard User</option>
                <option value="manager">Store Manager</option>
                <option value="admin">Administrator</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373] dark:text-[#b4b4b4]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-down w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
          {notice && (
            <p role="status" className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {NOT_AVAILABLE} — users sign in with Google/Zoho on their own.
            </p>
          )}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ebebeb] dark:border-[#262a33]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-[#262a33] dark:hover:bg-[#323743] border border-[#ebebeb] dark:border-[#262a33] text-sm font-semibold text-gray-950 dark:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-sm shadow-xs transition-all cursor-pointer active:scale-95"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UsersDirectorySection() {
  const overview = useAdminOverview();
  const usersQ = useAdminUsers();
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);

  const all = usersQ.data ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((u) =>
      [u.name, u.email, u.code].some((f) => (f ?? "").toLowerCase().includes(q)),
    );
  }, [all, query]);

  const o = overview.data;
  const byPlan = o?.usersByPlan ?? null;

  const emptyText = usersQ.isPending
    ? "Loading users…"
    : usersQ.isError
      ? "Could not load users."
      : query.trim()
        ? "No users match your search."
        : "No users yet.";

  return (
    <>
      <div className="flex flex-col w-full px-6 sm:px-8 pt-1 sm:pt-2 pb-8 space-y-6 text-[#0d0d0d] dark:text-[#ececec]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-gray-950 dark:text-white">
              User Directory
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadCsv(filtered)}
              className="px-7 py-3 sm:px-8 sm:py-3.5 bg-white dark:bg-[#1e222b] text-gray-900 dark:text-white border border-gray-200/90 dark:border-neutral-700/80 text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-md flex items-center gap-2.5 transition-all duration-150 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-download w-4 h-4 text-[#737373] dark:text-[#b4b4b4]"
                aria-hidden="true"
              >
                <path d="M12 15V3" />
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
              </svg>
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="px-7 py-3 sm:px-8 sm:py-3.5 bg-black dark:bg-white text-white dark:text-black text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-lg active:scale-95 hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all duration-150 cursor-pointer flex items-center gap-2.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user-plus w-4 h-4"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
              <span>Add User</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total App Users"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-users w-4 h-4 text-[#737373] dark:text-[#b4b4b4]"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            }
            value={`${num(o?.users)} Users`}
            valueClass="text-[#0d0d0d] dark:text-white"
            sub="Registered across platforms"
            subDot
          />
          <StatCard
            title="Wealthspan Pro Active"
            icon={SPARKLES("lucide lucide-sparkles w-4 h-4 text-emerald-500")}
            value={`${num(byPlan?.pro)} Users`}
            valueClass="text-emerald-600 dark:text-emerald-400"
            sub="Paid Pro subscription"
          />
          <StatCard
            title="Wealthspan Go Active"
            icon={ZAP("lucide lucide-zap w-4 h-4 text-blue-500")}
            value={`${num(byPlan?.go)} Users`}
            valueClass="text-blue-600 dark:text-blue-400"
            sub="Wealthspan Go plan"
          />
          <StatCard
            title="Free Tier Users"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-credit-card w-4 h-4 text-neutral-400"
                aria-hidden="true"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            }
            value={`${num(byPlan?.free)} Users`}
            valueClass="text-[#0d0d0d] dark:text-white"
            sub="Standard free access"
          />
        </div>
        <div className="w-full">
          <div className="relative w-full">
            {!query && (
              <label
                htmlFor="user-search-input"
                className="absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none left-11 top-1/2 -translate-y-1/2 px-0 text-sm font-normal text-[#737373] dark:text-[#b4b4b4] bg-transparent"
              >
                Search User Name, Email, Wealthspan ID...
              </label>
            )}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373] dark:text-[#b4b4b4] pointer-events-none z-10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-search w-4.5 h-4.5"
                aria-hidden="true"
              >
                <path d="m21 21-4.34-4.34" />
                <circle cx="11" cy="11" r="8" />
              </svg>
            </div>
            <input
              id="user-search-input"
              placeholder=""
              className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl pl-11 pr-5 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border border-[#ebebeb] dark:border-[#383838]"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#2f2f2f] border border-[#ebebeb] dark:border-[#383838] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f9f9f9] dark:bg-[#262626] text-[#737373] dark:text-[#b4b4b4] text-xs uppercase tracking-wider font-semibold border-b border-[#ebebeb] dark:border-[#383838]">
                  <th className="py-3.5 px-5">User & Photo</th>
                  <th className="py-3.5 px-5">Email Address</th>
                  <th className="py-3.5 px-5 font-mono">Wealthspan ID</th>
                  <th className="py-3.5 px-5">Current Plan</th>
                  <th className="py-3.5 px-5">Plan Validity</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-[#ebebeb]/60 dark:divide-[#383838]/60 text-[#0d0d0d] dark:text-[#ececec] text-xs"
                id="user-rows-container"
              >
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-xs text-[#737373] dark:text-[#b4b4b4]"
                    >
                      {emptyText}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <UserRowView
                      key={u.id}
                      user={u}
                      menuOpen={menuId === u.id}
                      onToggle={() => setMenuId((cur) => (cur === u.id ? null : u.id))}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-white dark:bg-[#2f2f2f] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#ebebeb] dark:border-[#383838]">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#737373] dark:text-[#b4b4b4]">
                {filtered.length === 0
                  ? "Showing 0 Users"
                  : `Showing 1 to ${filtered.length} of ${all.length} Users`}
              </span>
              <span className="text-[#737373]/30">•</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${usersQ.isError ? "bg-rose-500" : usersQ.isPending ? "bg-neutral-400" : "bg-emerald-500 animate-pulse"}`}
                />
                <span className="text-xs text-[#737373] dark:text-[#b4b4b4]">
                  {usersQ.isError
                    ? "Directory unavailable"
                    : usersQ.isPending
                      ? "Loading directory…"
                      : "Directory loaded from admin API"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} />}
    </>
  );
}
