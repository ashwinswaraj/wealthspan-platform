import { useState } from "react";
import { cn } from "@jobrio/utils/utils";
import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Detail,
  SectionTitle,
  WFShell,
} from "@admin/features/admin-dashboard/components/sections-shared";

/* ============================================================
 * ROLE ASSIGNMENT (multi sub-admin invites)
 * ============================================================ */

type SubAdminInvite = {
  id: string;
  email: string;
  name: string;
  status: "pending" | "active" | "revoked";
  invitedAt: string;
  permissions: string[];
};

const SEED_INVITES: SubAdminInvite[] = [
  {
    id: "INV-001",
    email: "anika.shah@jobrio.com",
    name: "Anika Shah",
    status: "active",
    invitedAt: "May 12, 2026",
    permissions: ["Orders", "Disputes", "Messages"],
  },
  {
    id: "INV-002",
    email: "vikram.r@jobrio.com",
    name: "Vikram R.",
    status: "pending",
    invitedAt: "May 22, 2026",
    permissions: ["Finance & Escrow", "Audit Logs"],
  },
];

const PERMISSION_OPTIONS = [
  "Dashboard",
  "Workforce Management",
  "Client Management",
  "Service Management",
  "Order Management",
  "Assignment Management",
  "Quality Assurance",
  "Finance & Escrow",
  "Dispute Resolution",
  "Platform Rules",
  "Audit Logs",
  "Messages",
];

const STATUS_STYLES: Record<SubAdminInvite["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  revoked: "bg-rose-50 text-rose-700",
};

export const RolesSection = () => {
  const [invites, setInvites] = useState<SubAdminInvite[]>(SEED_INVITES);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [perms, setPerms] = useState<string[]>([]);

  const togglePerm = (p: string) =>
    setPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const sendInvite = () => {
    if (!email.trim() || !name.trim() || perms.length === 0) return;
    setInvites((arr) => [
      {
        id: `INV-${String(arr.length + 1).padStart(3, "0")}`,
        email: email.trim(),
        name: name.trim(),
        status: "pending",
        invitedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        permissions: perms,
      },
      ...arr,
    ]);
    setEmail("");
    setName("");
    setPerms([]);
  };

  const revoke = (id: string) =>
    setInvites((arr) => arr.map((i) => (i.id === id ? { ...i, status: "revoked" as const } : i)));
  const resend = (id: string) =>
    setInvites((arr) => arr.map((i) => (i.id === id ? { ...i, status: "pending" as const } : i)));

  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState<SubAdminInvite | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <SectionHeader
          title="Access Control"
          subtitle="Super Admin only. Manage sub-admins, their permissions and access."
        />
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold bg-primary text-on-primary hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            person_add
          </span>
          Create Sub Admin
        </button>
      </div>

      <Card>
        <p className="text-sm font-bold text-on-surface mb-3">Sub-admins</p>
        <ul className="divide-y divide-surface-container-high/60">
          {invites.map((i) => (
            <li key={i.id} className="py-3 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-semibold text-on-surface">{i.name}</p>
                <p className="text-xs text-outline">{i.email}</p>
                <p className="text-[10px] text-outline mt-1">
                  {i.id} · invited {i.invitedAt}
                </p>
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase px-2.5 py-1 rounded-full",
                  STATUS_STYLES[i.status],
                )}
              >
                {i.status}
              </span>
              <button
                onClick={() => setViewing(i)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-90 whitespace-nowrap"
              >
                View Profile Details
              </button>
            </li>
          ))}
          {invites.length === 0 && (
            <li className="py-10 text-center text-xs text-on-surface-variant">
              No sub-admins yet.
            </li>
          )}
        </ul>
      </Card>

      {showCreate && (
        <WFShell
          subtitle="Access Control"
          title="Create Sub Admin"
          onClose={() => setShowCreate(false)}
        >
          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  Full Name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30"
                />
              </label>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2">
              Permissions
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {PERMISSION_OPTIONS.map((p) => {
                const on = perms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePerm(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                      on
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:border-primary/40",
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                sendInvite();
                setShowCreate(false);
              }}
              disabled={!email.trim() || !name.trim() || perms.length === 0}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Invitation
            </button>
          </Card>
        </WFShell>
      )}

      {viewing && (
        <WFShell
          subtitle={`Sub Admin · ${viewing.id}`}
          title={viewing.name}
          badge={
            <span
              className={cn(
                "text-[10px] font-bold uppercase px-2.5 py-1 rounded-full",
                STATUS_STYLES[viewing.status],
              )}
            >
              {viewing.status}
            </span>
          }
          onClose={() => setViewing(null)}
        >
          <Card>
            <SectionTitle title="Identity" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Full Name" v={viewing.name} />
              <Detail k="Sub Admin ID" v={viewing.id} />
              <Detail k="Email" v={viewing.email} />
              <Detail k="Status" v={viewing.status} />
              <Detail k="Invited On" v={viewing.invitedAt} />
              <Detail k="Role Type" v="Sub Admin" />
              <Detail k="Permissions" v={`${viewing.permissions.length} granted`} />
              <Detail k="Last Active" v="—" />
            </div>
          </Card>
          <Card>
            <SectionTitle title="Permissions" hint="Granted modules" />
            <div className="flex flex-wrap gap-1.5">
              {viewing.permissions.map((p) => (
                <span
                  key={p}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface"
                >
                  {p}
                </span>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle title="Invitation" />
            <p className="text-sm text-on-surface">
              Invited on <span className="font-semibold">{viewing.invitedAt}</span>
            </p>
          </Card>
          <div className="flex flex-wrap gap-2">
            {viewing.status !== "revoked" ? (
              <button
                onClick={() => {
                  revoke(viewing.id);
                  setViewing(null);
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
              >
                Revoke Access
              </button>
            ) : (
              <button
                onClick={() => {
                  resend(viewing.id);
                  setViewing(null);
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-90"
              >
                Re-invite
              </button>
            )}
          </div>
        </WFShell>
      )}
    </div>
  );
};

export default RolesSection;
