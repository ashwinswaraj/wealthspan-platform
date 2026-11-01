import { useState } from "react";
import { CatalystLoginSheet } from "./CatalystLoginSheet";
import { ArcMark, WealthspanWordmark } from "./Logo";

const wrapper =
  "auth-viewport fixed inset-0 z-50 flex flex-col bg-[#fafafa] dark:bg-[#0c0d12] text-[#0f172a] dark:text-[#f3f4f6] w-full max-w-full overflow-x-hidden overflow-y-auto overscroll-contain selection:bg-black selection:text-white font-sans";
const wrapperStyle = {
  paddingTop: "env(safe-area-inset-top, 0px)",
  paddingBottom: "env(safe-area-inset-bottom, 0px)",
  paddingLeft: "env(safe-area-inset-left, 0px)",
  paddingRight: "env(safe-area-inset-right, 0px)",
};

/** Login in the original Wealthspan look: Google, Zoho or email: all three open the Catalyst sign-in sheet (the sign-in itself runs on Catalyst, never in our code). */
export function LoginScreen(_props: { onLoggedIn?: () => void }) {
  const [email, setEmail] = useState("");
  const [sheet, setSheet] = useState(false);
  const [focused, setFocused] = useState(false);
  const hasText = email.length > 0;

  return (
    <div className={wrapper} style={wrapperStyle}>
      {sheet ? <CatalystLoginSheet onClose={() => setSheet(false)} /> : null}
      <div className="auth-initial-content w-full max-w-[420px] mx-auto flex flex-col justify-between items-center py-3 xs:py-4 sm:py-6 px-4 xs:px-6 box-border">
        <WealthspanWordmark className="shrink-0 pt-1" />
        <div className="w-full flex flex-col items-center my-auto py-2 sm:py-3 text-center select-none">
          <div className="relative flex flex-col items-center justify-center select-none">
            <div className="relative z-10 flex items-center justify-center overflow-visible">
              <ArcMark />
            </div>
          </div>
          <h1
            className="text-[22px] xs:text-[25px] sm:text-[29px] font-serif tracking-tight text-neutral-900 dark:text-white leading-snug sm:leading-tight text-center mt-1"
            style={{ fontFamily: "Newsreader, Georgia, serif" }}
          >
            <span>The full arc of your</span>
            <span className="block text-center">money</span>
          </h1>
        </div>
        <div className="w-full max-w-sm mx-auto flex flex-col gap-3 sm:gap-3.5 shrink-0 pt-2 pb-2">
          <div className="w-full py-2 px-3.5 rounded-2xl bg-neutral-100/90 dark:bg-neutral-900/80 border border-neutral-200/90 dark:border-neutral-800/90 flex items-center justify-center gap-2 text-center shadow-2xs backdrop-blur-xs transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#1d6de5] shadow-[0_0_8px_rgba(29,109,229,0.6)] animate-pulse shrink-0" />
            <span className="text-[12.5px] sm:text-[13px] font-medium text-neutral-800 dark:text-neutral-200">
              🎁 Sign up & get{" "}
              <span className="font-bold text-black dark:text-white">Wealthspan</span>{" "}
              <span className="font-bold text-[#1d6de5] dark:text-[#3b82f6]">Go 1 Month Free</span>{" "}
              trial!
            </span>
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="h-13 sm:h-14 min-h-[48px] rounded-[20px] sm:rounded-[24px] bg-[#18181b] dark:bg-white hover:bg-black dark:hover:bg-neutral-100 text-white dark:text-black font-medium text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="h-13 sm:h-14 min-h-[48px] rounded-[20px] sm:rounded-[24px] bg-[#18181b] dark:bg-white hover:bg-black dark:hover:bg-neutral-100 text-white dark:text-black font-medium text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-7 h-[13px] shrink-0" viewBox="0 6.6 24 10.8" aria-hidden="true">
                <defs>
                  <clipPath id="zoho-mark">
                    <path d="M8.66 6.897a1.299 1.299 0 0 0-1.205.765l-.642 1.44-.062-.385A1.291 1.291 0 0 0 5.27 7.648l-4.185.678A1.291 1.291 0 0 0 .016 9.807l.678 4.18a1.293 1.293 0 0 0 1.27 1.087c.074 0 .143-.01.216-.017l4.18-.678c.436-.07.784-.351.96-.723l2.933 1.307a1.304 1.304 0 0 0 .988.026c.321-.12.575-.365.716-.678l.28-.629.038.276a1.297 1.297 0 0 0 1.455 1.103l3.712-.501a1.29 1.29 0 0 0 1.03.514h4.236c.713 0 1.29-.58 1.291-1.291V9.545c0-.712-.58-1.291-1.291-1.291h-4.236c-.079 0-.155.008-.23.022a1.309 1.309 0 0 0-.275-.288c-.275-.21-.614-.3-.958-.253l-4.197.571c-.155.021-.3.07-.432.14L9.159 7.01a1.27 1.27 0 0 0-.499-.113zm-.025.705c.077 0 .159.013.24.052l2.971 1.324c-.128.238-.18.508-.142.782l.357 2.596h.002l-.745 1.672a.59.59 0 0 1-.777.296l-3.107-1.385-.004-.041-.41-2.526L8.1 7.95a.589.589 0 0 1 .536-.348zm-3.159.733c.125 0 .245.039.343.112.13.09.21.227.237.382l.234 1.446-.56 1.259a1.27 1.27 0 0 0-.026.987c.12.322.364.575.678.717l.295.131a.585.585 0 0 1-.428.314l-4.185.678a.59.59 0 0 1-.674-.485l-.678-4.18a.588.588 0 0 1 .485-.674l4.185-.678c.03-.004.064-.01.094-.01zm11.705.09a.59.59 0 0 1 .415.173 1.287 1.287 0 0 0-.416.947v4.237c0 .033.003.065.005.097l-3.55.482a.586.586 0 0 1-.66-.502l-.191-1.403.899-2.017a1.29 1.29 0 0 0-.333-1.5l3.754-.51c.026-.004.051-.004.077-.004zm1.3.532h4.227c.326 0 .588.266.588.588v4.237a.589.589 0 0 1-.588.588h-4.237a.564.564 0 0 1-.12-.013c.47-.246.758-.765.684-1.318zm-5.988.309.254.113c.296.133.43.48.296.777l-.432.97-.207-1.465a.58.58 0 0 1 .09-.395zm5.39.538.453 3.325a.583.583 0 0 1-.453.65zM6.496 11.545l.17 1.052a.588.588 0 0 1-.293-.776zm3.985 4.344a.588.588 0 0 0-.612.603c0 .358.244.61.601.61a.582.582 0 0 0 .607-.608c0-.35-.242-.605-.596-.605zm5.545 0a.588.588 0 0 0-.612.603c0 .358.245.61.602.61a.582.582 0 0 0 .606-.608c0-.35-.24-.605-.596-.605zm-8.537.018a.047.047 0 0 0-.048.047v.085c0 .026.021.047.048.047h.52l-.623.9a.052.052 0 0 0-.009.027v.027c0 .026.021.047.048.047h.815a.047.047 0 0 0 .047-.047v-.085a.047.047 0 0 0-.047-.047h-.55l.606-.9a.05.05 0 0 0 .008-.026v-.028a.047.047 0 0 0-.047-.047zm5.303 0a.047.047 0 0 0-.047.047v1.086c0 .026.02.047.047.047h.135a.047.047 0 0 0 .047-.047v-.454h.545v.454c0 .026.02.047.047.047h.134a.047.047 0 0 0 .047-.047v-1.086a.047.047 0 0 0-.047-.047h-.134a.047.047 0 0 0-.047.047v.453h-.545v-.453a.047.047 0 0 0-.047-.047zm-2.324.164c.25 0 .372.194.372.425 0 .219-.109.425-.358.426-.242 0-.375-.197-.375-.419 0-.235.108-.432.36-.432zm5.545 0c.25 0 .372.194.372.425 0 .219-.108.425-.358.426-.242 0-.374-.197-.374-.419 0-.235.108-.432.36-.432z" />
                  </clipPath>
                  <linearGradient id="zoho-fill" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#E42527" />
                    <stop offset="0.3" stopColor="#E42527" />
                    <stop offset="0.3" stopColor="#089949" />
                    <stop offset="0.52" stopColor="#089949" />
                    <stop offset="0.52" stopColor="#226DB4" />
                    <stop offset="0.67" stopColor="#226DB4" />
                    <stop offset="0.67" stopColor="#F9B21D" />
                    <stop offset="1" stopColor="#F9B21D" />
                  </linearGradient>
                </defs>
                <rect
                  y="6"
                  width="24"
                  height="12"
                  fill="url(#zoho-fill)"
                  clipPath="url(#zoho-mark)"
                />
              </svg>
              <span>Zoho</span>
            </button>
          </div>
          <div className="w-full flex items-center my-0.5 select-none">
            <div className="flex-grow border-t border-gray-200 dark:border-[#272b35]" />
            <span className="px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              OR
            </span>
            <div className="flex-grow border-t border-gray-200 dark:border-[#272b35]" />
          </div>
          <form
            className="w-full"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              setSheet(true);
            }}
          >
            <div id="email-input-container" className="w-full relative">
              <input
                id="email-input"
                type="email"
                data-auth-input="true"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`w-full h-13 sm:h-14 min-h-[48px] bg-transparent rounded-[20px] sm:rounded-[24px] text-gray-950 dark:text-white text-[16px] sm:text-base font-normal text-center focus:outline-none transition-all duration-200 ${hasText ? "px-14" : "px-5 xs:px-6"} ${focused ? "border-2 border-black dark:border-white" : hasText ? "border border-gray-400 dark:border-gray-500" : "border border-gray-300 dark:border-gray-700"}`}
              />
              <label
                htmlFor="email-input"
                className={`absolute pointer-events-none transition-all duration-200 ease-out select-none ${focused || hasText ? "top-0 -translate-y-1/2 left-4 xs:left-5 text-xs px-1.5 font-medium bg-[#fafafa] dark:bg-[#0c0d12] z-10 " + (focused ? "text-black dark:text-white font-semibold" : "text-gray-500 dark:text-gray-400") : "top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-sm sm:text-base text-gray-400 dark:text-gray-500 whitespace-nowrap"}`}
              >
                Enter your email
              </label>
              {hasText ? (
                <button
                  type="button"
                  id="email-submit-btn"
                  onClick={() => setSheet(true)}
                  aria-label="Submit email"
                  className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] bg-black dark:bg-white text-white dark:text-black rounded-full shadow-md active:scale-95 hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0 z-10"
                >
                  <svg
                    className="w-4 h-4 stroke-[2.5]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : null}
            </div>
          </form>
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-center mt-1 px-1 select-none">
            By continuing, you agree to Wealthspan's{" "}
            <a
              href="/terms-of-service"
              className="underline text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Consumer Terms
            </a>{" "}
            and{" "}
            <a
              href="/terms-of-service"
              className="underline text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Usage Policy
            </a>
            , and acknowledge their{" "}
            <a
              href="/privacy-policy"
              className="underline text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
