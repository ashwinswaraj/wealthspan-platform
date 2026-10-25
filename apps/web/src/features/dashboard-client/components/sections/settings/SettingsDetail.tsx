import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/dashboard/shared";
import { cn } from "@jobrio/utils/utils";
import {
  getPath,
  setPath,
  type AccountSettings,
  type PaymentMethod,
} from "../../../lib/account-settings";
import type { Field, SettingsItem } from "./schema";

const inputCls =
  "w-full rounded-2xl border border-outline-variant/50 bg-surface px-4 py-3 text-sm text-on-surface outline-none focus:border-primary/60 transition-colors";

const labelCls = "block text-xs font-semibold text-on-surface-variant mb-1.5";

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
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-4 text-left py-1"
  >
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-on-surface">{label}</span>
      {hint && <span className="block text-xs text-on-surface-variant mt-0.5">{hint}</span>}
    </span>
    <span
      className={cn(
        "shrink-0 w-12 h-7 rounded-full p-1 transition-colors",
        checked ? "bg-primary" : "bg-surface-container-highest",
      )}
    >
      <span
        className={cn(
          "block w-5 h-5 rounded-full bg-surface shadow transition-transform",
          checked && "translate-x-5",
        )}
      />
    </span>
  </button>
);

const TagsField = ({
  values,
  onChange,
  label,
  hint,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  label: string;
  hint?: string;
}) => {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return setDraft("");
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-on-surface"
          >
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-outline hover:text-destructive"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                close
              </span>
            </button>
          </span>
        ))}
        {values.length === 0 && <span className="text-xs text-outline">Nothing added yet.</span>}
      </div>
      <input
        className={inputCls}
        value={draft}
        placeholder="Type and press Enter"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
      />
      {hint && <p className="text-xs text-outline mt-1.5">{hint}</p>}
    </div>
  );
};

const FieldInput = ({
  field,
  draft,
  onChange,
}: {
  field: Field;
  draft: AccountSettings;
  onChange: (next: AccountSettings) => void;
}) => {
  const set = (value: unknown) => onChange(setPath(draft, field.path, value));
  const raw = getPath(draft, field.path);

  if (field.kind === "toggle")
    return (
      <Toggle
        checked={Boolean(raw)}
        onChange={set}
        label={field.label}
        hint={"hint" in field ? field.hint : undefined}
      />
    );

  if (field.kind === "tags")
    return (
      <TagsField
        values={Array.isArray(raw) ? (raw as string[]) : []}
        onChange={set}
        label={field.label}
        hint={field.hint}
      />
    );

  if (field.kind === "select")
    return (
      <label className="block">
        <span className={labelCls}>{field.label}</span>
        <select className={inputCls} value={String(raw ?? "")} onChange={(e) => set(e.target.value)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    );

  if (field.kind === "number")
    return (
      <label className="block">
        <span className={labelCls}>
          {field.label}
          {field.suffix ? ` (${field.suffix})` : ""}
        </span>
        <input
          type="number"
          className={inputCls}
          value={Number(raw ?? 0)}
          onChange={(e) => set(Number(e.target.value))}
        />
        {field.hint && <p className="text-xs text-outline mt-1.5">{field.hint}</p>}
      </label>
    );

  return (
    <label className="block">
      <span className={labelCls}>{field.label}</span>
      <input
        className={inputCls}
        value={String(raw ?? "")}
        placeholder={field.placeholder}
        onChange={(e) => set(e.target.value)}
      />
      {field.hint && <p className="text-xs text-outline mt-1.5">{field.hint}</p>}
    </label>
  );
};

const PasswordForm = ({ onSaved }: { onSaved: () => void }) => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const submit = () => {
    if (!current) return toast.error("Enter your current password.");
    if (next.length < 8) return toast.error("New password must be at least 8 characters.");
    if (next !== confirm) return toast.error("Passwords do not match.");
    setCurrent("");
    setNext("");
    setConfirm("");
    onSaved();
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className={labelCls}>Current password</span>
        <input
          type="password"
          className={inputCls}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </label>
      <label className="block">
        <span className={labelCls}>New password</span>
        <input
          type="password"
          className={inputCls}
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </label>
      <label className="block">
        <span className={labelCls}>Confirm new password</span>
        <input
          type="password"
          className={inputCls}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={submit}
        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Update password
      </button>
    </div>
  );
};

const SessionsList = ({
  settings,
  onChange,
}: {
  settings: AccountSettings;
  onChange: (next: AccountSettings) => void;
}) => (
  <div className="space-y-3">
    {settings.sessions.map((s) => (
      <div
        key={s.id}
        className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant/40 px-4 py-3"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">
            {s.device}
            {s.current && <span className="ml-2 text-[11px] text-primary">Current</span>}
          </p>
          <p className="text-xs text-on-surface-variant truncate">
            {s.location} · {s.lastActive}
          </p>
        </div>
        {!s.current && (
          <button
            type="button"
            onClick={() => {
              onChange({ ...settings, sessions: settings.sessions.filter((x) => x.id !== s.id) });
              toast.success("Session signed out.");
            }}
            className="shrink-0 text-xs font-semibold text-destructive hover:underline"
          >
            Sign out
          </button>
        )}
      </div>
    ))}
    {settings.sessions.filter((s) => !s.current).length > 0 && (
      <button
        type="button"
        onClick={() => {
          onChange({ ...settings, sessions: settings.sessions.filter((s) => s.current) });
          toast.success("All other devices signed out.");
        }}
        className="text-sm font-semibold text-destructive hover:underline"
      >
        Sign out all other devices
      </button>
    )}
  </div>
);

const PaymentMethods = ({
  settings,
  onChange,
}: {
  settings: AccountSettings;
  onChange: (next: AccountSettings) => void;
}) => {
  const [type, setType] = useState<PaymentMethod["type"]>("card");
  const [label, setLabel] = useState("");

  const add = () => {
    const v = label.trim();
    if (!v) return toast.error("Enter card last 4 digits or a UPI ID.");
    const method: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type,
      label: v,
      primary: settings.paymentMethods.length === 0,
    };
    onChange({ ...settings, paymentMethods: [...settings.paymentMethods, method] });
    setLabel("");
    toast.success("Payment method saved.");
  };

  return (
    <div className="space-y-4">
      {settings.paymentMethods.length === 0 && (
        <p className="text-sm text-on-surface-variant">No payment methods saved yet.</p>
      )}
      {settings.paymentMethods.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant/40 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">
              {m.type === "card" ? `Card ••${m.label}` : m.label}
              {m.primary && <span className="ml-2 text-[11px] text-primary">Primary</span>}
            </p>
            <p className="text-xs text-on-surface-variant capitalize">{m.type}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!m.primary && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...settings,
                    paymentMethods: settings.paymentMethods.map((x) => ({
                      ...x,
                      primary: x.id === m.id,
                    })),
                  })
                }
                className="text-xs font-semibold text-primary hover:underline"
              >
                Make primary
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const rest = settings.paymentMethods.filter((x) => x.id !== m.id);
                if (m.primary && rest[0]) rest[0] = { ...rest[0], primary: true };
                onChange({ ...settings, paymentMethods: rest });
                toast.success("Payment method removed.");
              }}
              className="text-xs font-semibold text-destructive hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="rounded-2xl bg-surface-container/60 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-outline">Add a method</p>
        <select
          className={inputCls}
          value={type}
          onChange={(e) => setType(e.target.value as PaymentMethod["type"])}
        >
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="netbanking">Net banking</option>
        </select>
        <input
          className={inputCls}
          value={label}
          placeholder={type === "card" ? "Last 4 digits" : "UPI ID or bank name"}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button
          type="button"
          onClick={add}
          className="px-5 py-3 rounded-2xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Add method
        </button>
      </div>
    </div>
  );
};

export const SettingsDetail = ({
  item,
  settings,
  onSave,
  onBack,
  onExport,
  onDelete,
}: {
  item: SettingsItem;
  settings: AccountSettings;
  onSave: (next: AccountSettings) => void;
  onBack: () => void;
  onExport: () => void;
  onDelete: () => void;
}) => {
  const [draft, setDraft] = useState<AccountSettings>(settings);
  const [confirmText, setConfirmText] = useState("");

  const commit = (next: AccountSettings, message = "Changes saved.") => {
    setDraft(next);
    onSave(next);
    toast.success(message);
  };

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to settings"
          className="w-9 h-9 rounded-full border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:bg-primary/5"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            arrow_back
          </span>
        </button>
        <div className="min-w-0">
          <p className="text-base font-bold text-on-surface truncate">{item.label}</p>
          <p className="text-xs text-on-surface-variant truncate">{item.desc}</p>
        </div>
      </div>

      {item.custom === "password" && (
        <PasswordForm
          onSaved={() =>
            commit(
              setPath(draft, "security.passwordUpdatedAt", new Date().toISOString()),
              "Password updated.",
            )
          }
        />
      )}

      {item.custom === "sessions" && (
        <SessionsList settings={draft} onChange={(next) => commit(next, "Sessions updated.")} />
      )}

      {item.custom === "payment-methods" && (
        <PaymentMethods
          settings={draft}
          onChange={(next) => {
            setDraft(next);
            onSave(next);
          }}
        />
      )}

      {item.custom === "export" && (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Download everything stored for your account on this device: your signup details and all
            settings, as a JSON file.
          </p>
          <button
            type="button"
            onClick={onExport}
            className="px-5 py-3 rounded-2xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Download my data
          </button>
        </div>
      )}

      {item.custom === "delete" && (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            This removes your account data from this device and signs you out. Type{" "}
            <span className="font-bold text-on-surface">DELETE</span> to confirm.
          </p>
          <input
            className={inputCls}
            value={confirmText}
            placeholder="DELETE"
            onChange={(e) => setConfirmText(e.target.value)}
          />
          <button
            type="button"
            disabled={confirmText !== "DELETE"}
            onClick={onDelete}
            className={cn(
              "px-5 py-3 rounded-2xl text-sm font-semibold transition-opacity",
              confirmText === "DELETE"
                ? "bg-destructive text-destructive-foreground hover:opacity-90"
                : "bg-surface-container text-outline cursor-not-allowed",
            )}
          >
            Delete my account
          </button>
        </div>
      )}

      {!item.custom && item.fields && (
        <div className="space-y-5">
          {item.fields.map((f) => (
            <FieldInput key={f.path} field={f} draft={draft} onChange={setDraft} />
          ))}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => commit(draft)}
              className="px-5 py-3 rounded-2xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setDraft(settings)}
              className="px-5 py-3 rounded-2xl border border-outline-variant/50 text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};
