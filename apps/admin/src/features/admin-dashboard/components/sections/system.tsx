import { useState, type FormEvent } from "react";
import { useAdminHealth } from "../../lib/adminApi";
import type { AdminHealthRow } from "../../lib/types";

const NOT_CONNECTED = "Saved settings are not connected yet";
const NOTE = "font-body-sm text-xs text-[#737373] dark:text-[#b4b4b4]";

function healthText(h: AdminHealthRow) {
  if (h.ok === null) return "—";
  if (!h.ok) return "Offline";
  return h.latencyMs === null ? "Online" : `Online · ${h.latencyMs}ms`;
}

function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative w-full">
      <label htmlFor={id} className="-top-2.5 left-4 px-1.5 text-xs font-semibold bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] rounded-sm absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl px-4 pr-11 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-[#ebebeb] dark:border-[#383838]">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373] dark:text-[#b4b4b4]">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373] dark:text-[#b4b4b4]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
      </div>
    </div>
  );
}

function AiCard({ aiCheck }: { aiCheck: AdminHealthRow | undefined }) {
  const [model, setModel] = useState("sarvam-105b");
  const [temp, setTemp] = useState(0.4);
  const [detail, setDetail] = useState("balanced");
  return (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#2f2f2f] border border-[#ebebeb] dark:border-[#383838] shadow-xs flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb] dark:border-[#383838]">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-5 h-5 text-indigo-500" aria-hidden="true">
                      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                      <path d="M20 2v4" />
                      <path d="M22 4h-4" />
                      <circle cx="4" cy="20" r="2" />
                    </svg>
                  <h2 className="text-base font-bold text-[#0d0d0d] dark:text-[#ececec]">
                    Sarvam AI Core
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f9f9f9] dark:bg-[#212121] border border-[#ebebeb] dark:border-[#383838] text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  {aiCheck ? healthText(aiCheck) : "—"}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mt-3">
                Review the Sarvam AI model settings used by the Wealthspan assistant for answers and categorisation.
              </p>
              <div className="space-y-4 mt-5">
                <SelectField
                  id="sys-ai-model"
                  label="Active Model Instance"
                  value={model}
                  onChange={setModel}
                  options={[{ value: "sarvam-105b", label: "Sarvam 105B (sarvam-105b)" }]}
                />
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <label htmlFor="sys-ai-temp" className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                      Model Sampling Temperature
                    </label>
                    <span className="font-mono text-sm text-primary font-semibold">
                      {temp.toFixed(2)}
                    </span>
                  </div>
                  <input
                    id="sys-ai-temp"
                    min="0"
                    max="1"
                    step="0.05"
                    className="w-full accent-primary cursor-pointer"
                    type="range"
                    value={temp}
                    onChange={(e) => setTemp(Number(e.target.value))}
                  />
                  <div className="flex justify-between font-label-sm text-label-sm text-outline mt-1 px-1">
                    <span>
                      0.0 (More deterministic)
                    </span>
                    <span>
                      1.0 (More varied)
                    </span>
                  </div>
                </div>
                <SelectField
                  id="sys-ai-detail"
                  label="Answer Detail"
                  value={detail}
                  onChange={setDetail}
                  options={[
                    { value: "concise", label: "Concise" },
                    { value: "balanced", label: "Balanced" },
                    { value: "detailed", label: "Detailed" },
                  ]}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-[#ebebeb] dark:border-[#383838] flex items-center justify-between gap-3">
              <span className={NOTE}>{NOT_CONNECTED}</span>
              <button type="button" disabled className="px-5 py-2.5 rounded-full bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] font-medium text-xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                Save AI Parameters
              </button>
            </div>
          </div>
  );
}

function BroadcastCard() {
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [severity, setSeverity] = useState("INFO");
  const [body, setBody] = useState("");
  const onSubmit = (e: FormEvent) => e.preventDefault();
  return (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#2f2f2f] border border-[#ebebeb] dark:border-[#383838] shadow-xs flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb] dark:border-[#383838]">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-radio w-5 h-5 text-emerald-500" aria-hidden="true">
                      <path d="M16.247 7.761a6 6 0 0 1 0 8.478" />
                      <path d="M19.075 4.933a10 10 0 0 1 0 14.134" />
                      <path d="M4.925 19.067a10 10 0 0 1 0-14.134" />
                      <path d="M7.753 16.239a6 6 0 0 1 0-8.478" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  <h2 className="text-base font-bold text-[#0d0d0d] dark:text-[#ececec]">
                    Broadcast Dispatcher
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#f9f9f9] dark:bg-[#212121] border border-[#ebebeb] dark:border-[#383838] text-[#0d0d0d] dark:text-[#ececec] font-semibold text-xs">
                  Not connected yet
                </span>
              </div>
              <p className="font-body-sm text-xs text-[#737373] dark:text-[#b4b4b4] mt-3">
                Draft an announcement or downtime notice for user dashboards.
              </p>
              <form className="space-y-4 mt-5" onSubmit={onSubmit}>
                <div className="relative w-full">
                  <label htmlFor="broadcast-title" className="absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none -top-2.5 left-4 px-1.5 text-xs font-semibold bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] rounded-sm">
                    Notification Title / Subject
                  </label>
                  <input id="broadcast-title" placeholder="" className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl px-4 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border border-[#0d0d0d]/40 dark:border-[#ececec]/40" required type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SelectField
                    id="broadcast-audience"
                    label="Target Audience"
                    value={audience}
                    onChange={setAudience}
                    options={[
                      { value: "ALL", label: "All Users" },
                      { value: "FREE", label: "Free Plan" },
                      { value: "GO", label: "Go Plan" },
                      { value: "PRO", label: "Pro Plan" },
                    ]}
                  />
                  <SelectField
                    id="broadcast-severity"
                    label="Severity Level"
                    value={severity}
                    onChange={setSeverity}
                    options={[
                      { value: "INFO", label: "Informational (Blue)" },
                      { value: "WARNING", label: "Advisory (Amber)" },
                      { value: "CRITICAL", label: "Critical Alert (Red)" },
                    ]}
                  />
                </div>
                <div className="relative w-full">
                  <label htmlFor="broadcast-body" className="absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none -top-2.5 left-4 px-1.5 text-xs font-semibold bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] rounded-sm">
                    Message Content
                  </label>
                  <textarea id="broadcast-body" rows={3} placeholder="" className="w-full bg-white dark:bg-[#212121] rounded-2xl p-4 pt-3 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border border-[#0d0d0d]/40 dark:border-[#ececec]/40" required value={body} onChange={(e) => setBody(e.target.value)} />
                </div>
                <div className="pt-2 flex items-center justify-between gap-3">
                  <span className={NOTE}>Sending broadcasts is not connected yet</span>
                  <button type="submit" disabled className="px-6 py-2.5 rounded-full bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] font-medium text-xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all cursor-pointer shadow-xs flex items-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send w-3.5 h-3.5" aria-hidden="true">
                        <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                        <path d="m21.854 2.147-10.94 10.939" />
                      </svg>
                    <span>
                      Dispatch Broadcast
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
  );
}

function HealthCard({ checks, okCount, loading, error }: { checks: AdminHealthRow[]; okCount: number; loading: boolean; error: boolean }) {
  return (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#2f2f2f] border border-[#ebebeb] dark:border-[#383838] shadow-xs flex flex-col justify-between space-y-5 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb] dark:border-[#383838]">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check w-5 h-5 text-emerald-500" aria-hidden="true">
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  <h2 className="text-base font-bold text-[#0d0d0d] dark:text-[#ececec]">
                    Service Health
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#f9f9f9] dark:bg-[#212121] border border-[#ebebeb] dark:border-[#383838] text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  {checks.length ? `${okCount}/${checks.length} online` : "—"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {checks.length === 0 && (
                  <div className="md:col-span-3 p-4 rounded-2xl bg-[#f9f9f9] dark:bg-[#212121] border border-[#ebebeb] dark:border-[#383838] font-body-sm text-[#737373] dark:text-[#b4b4b4] text-xs">
                    {error ? "Health checks unavailable" : loading ? "Checking…" : "No checks reported"}
                  </div>
                )}
                {checks.map((c, i) => (
                  <div key={c.name} className="p-4 rounded-2xl bg-[#f9f9f9] dark:bg-[#212121] border border-[#ebebeb] dark:border-[#383838] space-y-3">
                    <div className="relative w-full">
                      <label htmlFor={`health-check-${i}`} className="absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none -top-2.5 left-4 px-1.5 text-xs font-semibold bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] rounded-sm">
                        {c.name}
                      </label>
                      <input id={`health-check-${i}`} placeholder="" className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl px-4 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border border-[#0d0d0d]/40 dark:border-[#ececec]/40" type="text" readOnly value={healthText(c)} />
                    </div>
                    <span className="font-body-sm text-[#737373] dark:text-[#b4b4b4] block text-xs px-1">
                      {c.ok === null ? "Not checked." : `Round-trip ${c.latencyMs === null ? "—" : `${c.latencyMs}ms`}.`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
  );
}

export function SystemSection() {
  const health = useAdminHealth();
  const checks = health.data ?? [];
  const okCount = checks.filter((c) => c.ok === true).length;
  const aiCheck = checks.find((c) => /sarvam|\bai\b/i.test(c.name));
  return (
    <>
    <div className="flex flex-col w-full min-h-full bg-white dark:bg-[#16191f] pb-16 text-[#0d0d0d] dark:text-[#ececec]">
      <div className="px-6 sm:px-8 pt-1 sm:pt-2 pb-6 flex flex-col gap-6 border-b border-[#ebebeb] dark:border-[#2f2f2f] bg-white dark:bg-[#16191f]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center flex-wrap gap-3.5">
            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-gray-950 dark:text-white">
              Health Configuration & Telemetry
            </h1>
            <span className="px-3.5 py-1.5 rounded-full bg-[#f4f4f4] dark:bg-[#212121] border border-[#ebebeb] dark:border-[#383838] text-neutral-800 dark:text-neutral-200 text-xs sm:text-[13px] font-semibold shadow-2xs">
              {checks.length ? `${okCount}/${checks.length} services online` : "Health: —"}
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-3">
            <button
              type="button"
              disabled={health.isFetching}
              onClick={() => void health.refetch()}
              className="px-7 py-3 sm:px-8 sm:py-3.5 bg-white dark:bg-[#1e222b] text-gray-900 dark:text-white border border-gray-200/90 dark:border-neutral-700/80 text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-md hover:bg-neutral-50 dark:hover:bg-[#262b37] transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-2.5 disabled:opacity-60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw w-4 h-4 stroke-[2.2]" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>
                Re-check Health
              </span>
            </button>
            <button
              type="button"
              onClick={() => downloadJson("wealthspan-diagnostics.json", { generatedAt: new Date().toISOString(), checks })}
              className="px-7 py-3 sm:px-8 sm:py-3.5 bg-black dark:bg-white text-white dark:text-black text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-lg active:scale-95 hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all duration-150 cursor-pointer flex items-center gap-2.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text w-4 h-4 stroke-[2.2]" aria-hidden="true">
                <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                <path d="M10 9H8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
              </svg>
              <span>
                Export Diagnostics
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="px-6 sm:px-8 py-8 flex flex-col gap-8 max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AiCard aiCheck={aiCheck} />
          <BroadcastCard />
          <HealthCard checks={checks} okCount={okCount} loading={health.isLoading} error={health.isError} />
        </div>
      </div>
    </div>
    </>
  );
}
