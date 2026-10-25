import { useState, type ReactNode } from "react";
import { LogoBriefcase } from "@jobrio/ui/shared/LogoBriefcase";
import {
  AuthInput,
  AuthFieldShell,
  AuthErrorText,
  Button,
  OverlaySpinner,
  ButtonSpinner,
} from "@jobrio/ui/design-system";
import { validateEmail } from "@jobrio/validation";

export interface SignUpProps {
  /** Navigate to an in-app path (router-agnostic so both apps can supply their own). */
  navigate: (to: string) => void;
  /** Optional app-specific slot rendered where the demo launcher sits. */
  demoLauncher?: ReactNode;
}

export const SignUp = ({ navigate, demoLauncher = null }: SignUpProps) => {
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState("");
  // Custom validation message — native browser bubbles are disabled.
  const [emailError, setEmailError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [continuing, setContinuing] = useState(false);

  const handleContinue = async () => {
    const emailErr = validateEmail(email, "Work email");
    const termsErr = agreed ? null : "Please accept the Privacy Policy and Terms of Service.";
    setEmailError(emailErr);
    setTermsError(termsErr);
    if (emailErr || termsErr || continuing) return;
    setContinuing(true);
    await new Promise((r) => setTimeout(r, 700));
    navigate("/signup/intent");
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-surface"
      style={{ fontFamily: "Inter, sans-serif", color: "#191c1e" }}
    >
      <main className="flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[120px]"
          style={{ background: "rgba(0,74,198,0.05)" }}
        ></div>
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[120px]"
          style={{ background: "rgba(0,81,177,0.05)" }}
        ></div>

        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-5 space-y-8">
            <div>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-80 hover:scale-[1.02] active:scale-[0.98] mb-5"
                style={{ color: "#434655" }}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back
              </button>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #004AC6 0%, #004AC6 50%, #004AC6 100%)",
                    boxShadow: "0 10px 25px rgba(0,74,198,0.4)",
                  }}
                >
                  <LogoBriefcase />
                </div>
                <span className="text-2xl font-bold tracking-tighter" style={{ color: "#191c1e" }}>
                  Jobrio
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h1
                className="text-[2.5rem] md:text-[3.5rem] font-bold leading-[1.1] tracking-tight"
                style={{ color: "#191c1e" }}
              >
                Create your account on{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Jobrio.
                </span>
              </h1>
              <p className="text-[1.125rem] max-w-md leading-relaxed" style={{ color: "#434655" }}>
                Sign up with your work email to join the future of managed work — for enterprises
                and professionals alike.
              </p>
            </div>

            <div
              className="hidden lg:block pt-8"
              style={{ borderTop: "1px solid rgba(195,198,215,0.3)" }}
            >
              <div className="flex -space-x-3">
                <img
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  alt=""
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD0SbdRNNa_UpNj0VjCbJZcO9GM0IhapvxykOKs3_I3o7U77oa_eAd5W4heuKXdlNWxBbvFICZTWV3kx-Ku40k59uJ4SHkEpNAbViwFacUVow4u2_X0plr1K1N3XilcMIedrJ7t2yAFS4om1S8R5BCvEyizCDr52tem46cAqANp_nXluEaN1KCOlpDvt57nhhC6Y6dkMhMtb7Fv04ch14F-kwWK2uzeI8k-20b9rqAko-09JhC6MDkj8DjiaBMX-LxNmnAcFppYZfx"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  alt=""
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9vhTcCQikB8T9MsVGe1s3gVWD9KajbL_sKAMf2G44mAv_M4U8OM9X7hdDb4116_PKxpM5KYW9s6PaxuTMGlhIJxspLNkfqnMfZ_K2gh_kN-4V62M_5cITr0emrfvKYim2NC_lPMuPQTIlhQS4TXf9TYhNitfBSqsZXtk-OvKZs8QrW7ZYqwg9ow3WA_kn7AuGPhnf4DjVDwxlae7pAsBw0_8gSZ8gdA8lc7aqep5TymfPBf6TG4_bmqL_U4fBHFUl7k9OJ5-lckCB"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  alt=""
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE6uVHE3ogC4f9y8cRG5nNG8PQbXAs3OeHPp2qdXUzjliAUdR0Up8R-TNlKX_VYcmTec_MVlmwXBKCKr5Vs3EXyxeIzVviAkuMfijqUGZFXmuet_umUOUIvmg6hBSkae--l9pcmoZhPmda-lFn6Xig0Xn2DOIcnHJ3-_7le9g-XwjtViEZiBW2pHAKZQUIZ_FHftMVfgiK9p8uKouJn0U-EfJDd4jIglMpmj5hH2hQeFyknXoUDSTvdMgBP6t708bT2Yaz44kEmBK4"
                />
                <div
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-[0.6875rem] font-bold"
                  style={{ background: "#e6e8ea", color: "#434655" }}
                >
                  {" "}
                  +2k{" "}
                </div>
              </div>
              <p
                className="mt-4 text-[0.6875rem] font-semibold uppercase tracking-wider"
                style={{ color: "#737686" }}
              >
                TRUSTED BY 2,000+ ENTERPRISES &amp; PROFESSIONALS
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              className="relative rounded-2xl p-8 md:p-10"
              style={{
                background: "#ffffff",
                boxShadow: "0 24px 48px rgba(15,23,42,0.06)",
                border: "1px solid rgba(195,198,215,0.3)",
              }}
            >
              <div className="mb-10">
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#191c1e" }}>
                  Sign Up
                </h2>
                <p className="text-sm mt-2" style={{ color: "#434655" }}>
                  Enter your work email to get started. We'll ask for your intent next.
                </p>
              </div>

              <div className="space-y-6">
                <button
                  className="w-full h-12 flex items-center justify-center gap-3 bg-white font-medium rounded-xl transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.96]"
                  style={{ border: "1px solid #c3c6d7", color: "#191c1e" }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    ></path>
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    ></path>
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    ></path>
                  </svg>
                  Continue with Google
                </button>

                <div className="relative flex items-center py-2">
                  <div
                    className="flex-grow"
                    style={{ borderTop: "1px solid rgba(195,198,215,0.3)" }}
                  ></div>
                  <span
                    className="flex-shrink mx-4 text-[0.6875rem] font-bold uppercase tracking-widest"
                    style={{ color: "#737686" }}
                  >
                    or
                  </span>
                  <div
                    className="flex-grow"
                    style={{ borderTop: "1px solid rgba(195,198,215,0.3)" }}
                  ></div>
                </div>

                <div className="space-y-4">
                  <AuthFieldShell label="Work Email" error={emailError}>
                    <AuthInput
                      value={email}
                      invalid={!!emailError}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(validateEmail(e.target.value, "Work email"));
                      }}
                      onBlur={() => setEmailError(validateEmail(email, "Work email"))}
                      type="email"
                    />
                  </AuthFieldShell>

                  <div className="flex items-center gap-3 px-1">
                    <input
                      className="h-5 w-5 rounded cursor-pointer"
                      style={{ accentColor: "#004AC6" }}
                      id="terms"
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => {
                        setAgreed(e.target.checked);
                        if (termsError && e.target.checked) setTermsError(null);
                      }}
                    />
                    <label
                      className="text-sm font-medium cursor-pointer"
                      style={{ color: "#434655" }}
                      htmlFor="terms"
                    >
                      I agree to the{" "}
                      <a
                        className="hover:underline"
                        href="/privacy-policy"
                        style={{ color: "#004AC6" }}
                      >
                        Privacy Policy
                      </a>{" "}
                      and{" "}
                      <a
                        className="hover:underline"
                        href="/terms-of-service"
                        style={{ color: "#004AC6" }}
                      >
                        Terms of Service
                      </a>
                    </label>
                  </div>

                  <AuthErrorText>{termsError}</AuthErrorText>

                  <Button
                    onClick={handleContinue}
                    variant="primary"
                    size="md"
                    block
                    className="h-12 rounded-full"
                  >
                    {continuing ? <ButtonSpinner /> : "Continue"}
                  </Button>
                </div>
                <OverlaySpinner show={continuing} />
              </div>

              <p className="mt-8 text-center text-sm" style={{ color: "#434655" }}>
                Already have an account?{" "}
                <a
                  onClick={() => navigate("/login")}
                  className="font-bold hover:underline decoration-2 underline-offset-4 cursor-pointer"
                  style={{ color: "#004AC6" }}
                >
                  Sign in
                </a>
              </p>
              {demoLauncher}
            </div>

            <div
              className="mt-8 flex justify-center gap-6 text-[0.6875rem] font-medium uppercase tracking-wider"
              style={{ color: "#737686" }}
            >
              <a className="hover:opacity-80 transition-colors" href="/privacy-policy">
                Privacy Policy
              </a>
              <a className="hover:opacity-80 transition-colors" href="/terms-of-service">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
