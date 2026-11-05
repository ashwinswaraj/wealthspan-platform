import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/services/api";

type Tab = "go" | "pro";
type Billing = "monthly" | "annual";

const GO_ROWS: [string, boolean][] = [
  ["Unlimited text chat", true],
  ["More messages with tools", false],
  ["More file storage", false],
  ["More image creation", false],
  ["More voice chats", false],
  ["Longer memory", false],
];
const PRO_ROWS: [string, boolean][] = [
  ...GO_ROWS,
  ["Priority reasoning speed", false],
  ["Multi-project business reports", false],
];

const PLANS = {
  go: {
    sub: "Keep chatting with expanded access",
    monthly: { off: "100% off", price: "₹0.00", unit: "for 1 month", then: "Then ₹399.00 / month" },
    annual: { price: "₹3,799.00", unit: "/ year" },
    note: "This plan may include ads.",
  },
  pro: {
    sub: "Highest speed, reasoning & multi-project power",
    monthly: {
      off: "50% off",
      price: "₹1,000.00",
      unit: "/ month",
      then: "Then ₹1,999.00 / month",
    },
    annual: { price: "₹18,999.00", unit: "/ year" },
    note: "Ad-free experience with top priority access.",
  },
} as const;

const tick = (cls: string) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

/** The Wealthspan Go / Pro screen, as in the original. Checkout is not connected yet, so the button only closes the screen. */
export function UpgradeScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("go");
  const [billing, setBilling] = useState<Billing>("monthly");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const qc = useQueryClient();

  const startTrial = async () => {
    setBusy(true);
    setMsg("");
    try {
      await api("finance", "/subscription/trial", { method: "POST", body: {} });
      await qc.invalidateQueries({ queryKey: ["subscription"] });
      onBack();
    } catch (e) {
      // 409 means the trial was already started: that is fine, the plan is active.
      if (e instanceof ApiError && e.status === 409) setMsg("Your free trial was already used.");
      else setMsg(e instanceof ApiError ? e.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };
  const restore = async () => {
    setBusy(true);
    try {
      const e = await api<{ active: boolean }>("finance", "/subscription");
      setMsg(e.active ? "Your plan is active." : "No active plan found on this account.");
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };
  const plan = PLANS[tab];
  const rows = tab === "go" ? GO_ROWS : PRO_ROWS;
  const name = tab === "go" ? "Go" : "Pro";
  const m = billing === "monthly";
  const cta =
    tab === "go" && m
      ? "Try Go Free"
      : `Upgrade for ${m ? `${plan.monthly.price} / month` : `${plan.annual.price} / year`}`;
  const ctaSub =
    tab === "go" && m
      ? "1 Month Free Trial • No Credit Card Required"
      : m
        ? null
        : `Equivalent to ₹${tab === "go" ? "317" : "1,583"}/mo • Billed annually`;
  const tabBtn = (t: Tab, label: string, first: boolean) => (
    <button
      id={`tab_${t}_btn`}
      type="button"
      onClick={() => setTab(t)}
      className={`flex-1 h-full flex items-center justify-center text-[13px] sm:text-sm font-semibold transition-colors cursor-pointer truncate px-2 ${first ? "border-r border-[#d1d5db] dark:border-[#383838]" : ""} ${tab === t ? "bg-[#ececec] dark:bg-[#333333] text-black dark:text-white font-bold" : "bg-white dark:bg-[#1e1e1e] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#252525]"}`}
    >
      {label}
    </button>
  );
  const planBtn = (b: Billing, on: boolean, grow: string, children: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setBilling(b)}
      className={`relative flex-1 text-left p-3 rounded-[18px] transition-all duration-200 ease-out focus:outline-none flex flex-col ${grow} cursor-pointer active:scale-[0.98] border-[1.5px] border-neutral-300 dark:border-[#202327] ${on ? "bg-neutral-100/90 dark:bg-[#121417] shadow-sm" : "bg-transparent dark:bg-[#121417]/40 hover:bg-neutral-50/70"}`}
    >
      <div
        className={`absolute -inset-[1.5px] rounded-[18px] border-[1.5px] border-black dark:border-white pointer-events-none transition-opacity duration-200 ease-out z-10 ${on ? "opacity-100" : "opacity-0"}`}
      />
      {children}
    </button>
  );

  return (
    <div
      id="upgradePageOverlay"
      className="fixed inset-0 z-50 bg-white dark:bg-[#121212] flex justify-center items-start overflow-hidden"
    >
      <div className="w-full max-w-[500px] h-[100dvh] bg-white dark:bg-[#121212] flex flex-col overflow-hidden relative">
        <header className="w-full pt-2 sm:pt-3 px-5 sm:px-6 pb-2 flex items-start z-30 shrink-0 sticky top-0 relative select-none bg-transparent">
          <div
            className="absolute inset-x-0 top-0 h-[80px] sm:h-[86px] pointer-events-none z-10 bg-gradient-to-b from-white/95 dark:from-[#121212]/95 from-0% via-white/80 dark:via-[#121212]/80 via-45% via-white/40 dark:via-[#121212]/40 via-75% via-white/10 dark:via-[#121212]/10 via-92% to-transparent backdrop-blur-[4px]"
            aria-hidden="true"
          />
          <div className="relative z-20 flex items-start gap-3 w-full">
            <button
              id="upgradeBackBtn"
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="relative z-20 w-11 h-11 rounded-full border border-[#ebebeb] dark:border-[#2f2f2f] shadow-sm flex items-center justify-center text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] active:bg-gray-200 dark:active:bg-[#303030] focus:outline-none active:scale-95 transition-all duration-150 cursor-pointer shrink-0 mt-0.5 bg-white dark:bg-[#1a1a1a]"
            >
              <svg
                className="w-5 h-5 stroke-[2.25]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="relative z-20 flex flex-col min-w-0 pt-0.5">
              <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white flex items-baseline gap-1.5 leading-tight">
                <span>Wealthspan</span>
                <span className="text-[#1d6de5]">{name}</span>
              </h1>
              <p className="text-[13px] sm:text-[13.5px] text-neutral-500 dark:text-neutral-400 font-normal mt-0.5 leading-snug">
                {plan.sub}
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-6 -mt-[56px] sm:-mt-[60px] pt-[68px] sm:pt-[74px] pb-1 no-scrollbar">
          <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800/60 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
              1M
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                  1 Month Free Trial
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Wealthspan Go
                </span>
              </div>
              <p className="text-[12px] text-neutral-600 dark:text-neutral-300 leading-tight mt-0.5">
                Sign up to get 1 month of Wealthspan Go free! Upgrade anytime to Pro or renew.
              </p>
            </div>
          </div>
          <div className="mt-4 h-9 sm:h-[38px] border border-[#d1d5db] dark:border-[#383838] rounded-full flex overflow-hidden bg-white dark:bg-[#1e1e1e]">
            {tabBtn("go", "Go", true)}
            {tabBtn("pro", "Pro", false)}
          </div>
          <div className="rounded-[28px] border border-neutral-300/80 dark:border-[#2f2f2f] p-5 sm:p-6 mt-4 mb-2 bg-white dark:bg-[#1a1a1a] shadow-xs">
            <div className="flex items-center justify-between pb-3 text-[14.5px] font-medium border-b border-neutral-100 dark:border-[#262626]">
              <span className="text-neutral-500 dark:text-neutral-400">Features</span>
              <div className="flex items-center gap-7">
                <span className="text-neutral-500 dark:text-neutral-400 w-10 text-center">
                  Free
                </span>
                <span className="font-semibold w-12 text-center truncate text-[#1d6de5]">
                  {name}
                </span>
              </div>
            </div>
            <div className="space-y-4 pt-3">
              {rows.map(([label, free]) => (
                <div key={label} className="flex items-center justify-between text-[15px] py-1">
                  <span className="text-neutral-900 dark:text-neutral-100 font-normal pr-3">
                    {label}
                  </span>
                  <div className="flex items-center gap-7 shrink-0">
                    <div className="w-10 flex items-center justify-center">
                      {free ? (
                        tick("w-5 h-5 text-neutral-600 dark:text-neutral-400 stroke-[2.25]")
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-600 font-medium text-lg leading-none select-none">
                          —
                        </span>
                      )}
                    </div>
                    <div className="w-12 flex items-center justify-center text-[#1d6de5]">
                      {tick("w-5 h-5 stroke-[2.5]")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <footer className="w-full pb-3 sm:pb-3.5 pt-1 px-6 z-30 shrink-0 select-none bg-white dark:bg-[#121212] relative">
          <div className="relative z-20 w-full flex flex-col">
            <div className="w-full flex items-stretch gap-2.5 mb-2.5 select-none relative">
              {planBtn(
                "monthly",
                m,
                "justify-between",
                <>
                  <div className="flex items-center justify-between w-full mb-1 relative z-20">
                    <span
                      className={`text-[15px] tracking-tight ${m ? "font-semibold text-black dark:text-white" : "font-medium text-[#71767b]"}`}
                    >
                      Monthly
                    </span>
                    <span className="text-[13px] font-medium text-[#1d9bf0] leading-none">
                      {plan.monthly.off}
                    </span>
                  </div>
                  <div className="mt-0.5 relative z-20">
                    <span
                      className={`text-[18px] tracking-tight block leading-tight ${m ? "font-bold text-black dark:text-white" : "font-medium text-[#71767b]"}`}
                    >
                      {plan.monthly.price}{" "}
                      <span className="font-normal text-[15px]">{plan.monthly.unit}</span>
                    </span>
                  </div>
                  <div className="mt-1 relative z-20">
                    <span className="text-[13px] text-[#71767b] block leading-tight">
                      {plan.monthly.then}
                    </span>
                  </div>
                </>,
              )}
              {planBtn(
                "annual",
                !m,
                "justify-start",
                <>
                  <div className="w-full mb-1 relative z-20">
                    <span
                      className={`text-[15px] tracking-tight ${!m ? "font-semibold text-black dark:text-white" : "font-medium text-[#71767b]"}`}
                    >
                      Annual
                    </span>
                  </div>
                  <div className="mt-0.5 relative z-20">
                    <span
                      className={`text-[18px] tracking-tight block leading-tight ${!m ? "font-bold text-black dark:text-white" : "font-medium text-[#71767b]"}`}
                    >
                      {plan.annual.price} <span className="text-[14px]">{plan.annual.unit}</span>
                    </span>
                  </div>
                </>,
              )}
            </div>
            <button
              id="upgradeActionBtn"
              type="button"
              disabled={busy}
              onClick={() =>
                tab === "go" && m
                  ? void startTrial()
                  : setMsg("Online payment opens soon. Start with the free Go trial.")
              }
              className="disabled:opacity-60 w-full py-3.5 px-6 rounded-full font-semibold text-base sm:text-[16.5px] transition-all shadow-md cursor-pointer flex flex-col items-center justify-center active:scale-[0.98] bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 active:bg-neutral-700"
            >
              <span className="leading-tight text-[17px] tracking-tight">{cta}</span>
              {ctaSub ? (
                <span className="text-[11.5px] opacity-80 font-normal mt-0.5">{ctaSub}</span>
              ) : null}
            </button>
            {msg ? (
              <p
                role="status"
                className="text-center text-[12.5px] text-neutral-600 dark:text-neutral-300 mt-2"
              >
                {msg}
              </p>
            ) : null}
            <div className="text-center mt-2">
              <button
                id="restoreSubscriptionBtn"
                type="button"
                disabled={busy}
                onClick={() => void restore()}
                className="font-medium text-[14px] sm:text-[15px] text-neutral-900 dark:text-neutral-200 hover:text-black dark:hover:text-white active:opacity-75 transition-opacity cursor-pointer"
              >
                Restore subscription
              </button>
            </div>
            <div className="text-center mt-1.5">
              <p className="text-[12.5px] text-neutral-500 dark:text-neutral-400">
                {plan.note}{" "}
                <a href="#learn-more" className="text-[#1d6de5] hover:underline cursor-pointer">
                  Learn more
                </a>
                .
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
