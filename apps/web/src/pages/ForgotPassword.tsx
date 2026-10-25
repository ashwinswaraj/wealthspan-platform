import { useSkeleton, PageSpinner } from "@jobrio/ui/design-system";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@/lib/react-router-dom";
import { LogoBriefcase } from "@jobrio/ui/shared/LogoBriefcase";
import {
  AuthInput,
  AuthFieldShell,
  Button,
  PasswordStrength,
  OverlaySpinner,
  ButtonSpinner,
} from "@jobrio/ui/design-system";
import { validateEmail, validatePassword, validatePasswordMatch } from "@jobrio/validation";

const RESEND_COOLDOWN = 30;

type Step = "email" | "sent" | "reset";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [resendTimer, setResendTimer] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  // Custom (non-browser) inline validation messages
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if URL has recovery token
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setStep("reset");
    }
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email, "Work email");
    setEmailError(err);
    if (err) return;
    setSending(true);
    try {
      // Local-first simulation: no backend/email provider connected yet.
      // Swap this block for a real password-reset call (e.g. Supabase
      // `auth.resetPasswordForEmail`) once a backend is wired up.
      await new Promise((r) => setTimeout(r, 800));
      setStep("sent");
      setResendTimer(RESEND_COOLDOWN);
    } catch {
      setError("Unable to send reset link. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleResend = useCallback(() => {
    if (resendTimer > 0) return;
    setResendTimer(RESEND_COOLDOWN);
  }, [resendTimer]);

  const handleOpenMail = () => {
    const domain = email.split("@")[1]?.toLowerCase();
    let mailUrl = "mailto:";
    if (domain === "gmail.com") mailUrl = "https://mail.google.com";
    else if (domain === "outlook.com" || domain === "hotmail.com" || domain === "live.com")
      mailUrl = "https://outlook.live.com";
    else if (domain === "yahoo.com") mailUrl = "https://mail.yahoo.com";
    else if (domain === "icloud.com" || domain === "me.com")
      mailUrl = "https://www.icloud.com/mail";
    window.open(mailUrl, "_blank");
  };

  const handleEditEmail = () => {
    setStep("email");
    setShowHelp(false);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const pwErr = validatePassword(password, "Password");
    const matchErr = validatePasswordMatch(password, confirmPassword);
    setPasswordError(pwErr);
    setConfirmError(matchErr);
    if (pwErr || matchErr) return;
    setLoading(true);
    try {
      // Local-first simulation: no backend connected yet. Swap this block
      // for a real password-update call (e.g. Supabase `auth.updateUser`)
      // once a backend is wired up.
      await new Promise((r) => setTimeout(r, 800));
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const leftHeading =
    step === "reset" ? (
      <>
        Create new{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          password.
        </span>
      </>
    ) : (
      <>
        Reset your{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          password.
        </span>
      </>
    );

  const leftDesc =
    step === "reset"
      ? "Choose a strong password to secure your account. You'll be signed in automatically after."
      : "We'll send a reset link to your email. Click it to create a new password and get back in.";

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
          {/* Left Side: Branding */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-80 hover:scale-[1.02] active:scale-[0.98] mb-5"
                style={{ color: "#434655" }}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back
              </button>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
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
                {leftHeading}
              </h1>
              <p className="text-[1.125rem] max-w-md leading-relaxed" style={{ color: "#434655" }}>
                {leftDesc}
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
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE6uVHE3ogC4f9y8cRG5nNG8PQbXAs3OeHPp2qdXUzjliAUdR0Up8R-TNlKX_VYcmTec_MVlmwXBKCKr5Vs3EXyxeIzVviAkuMfijqUGZFXmuet_umUOUIvmg6hBSkae--l9pcmoZhPmda-lFn6Xig0Xn2DOIcnHJ3-_7le9g-XwjtViEZiBW2pHAKZQUIZ_FHftMVfgiK9p8uKouJn0U-EfJDd4jIglMpmj5hH2hQeFyknXoUDSTvdMgBP6t768bT2Yaz44kEmBK4"
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

          {/* Right Side: Card */}
          <div className="lg:col-span-7">
            <div
              className="relative rounded-2xl p-8 md:p-10"
              style={{
                background: "#ffffff",
                boxShadow: "0 24px 48px rgba(15,23,42,0.06)",
                border: "1px solid rgba(195,198,215,0.3)",
              }}
            >
              {step === "email" && (
                <>
                  <div className="mb-10">
                    <div className="relative w-16 h-16 mb-6 mx-auto">
                      <div
                        className="absolute inset-0 rounded-2xl blur-xl opacity-40"
                        style={{ background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)" }}
                      ></div>
                      <div
                        className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{
                          background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)",
                          boxShadow: "0 10px 25px -5px rgba(0,74,198,0.35)",
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[30px] text-white"
                          style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
                        >
                          lock_reset
                        </span>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#191c1e" }}>
                      Forgot Password?
                    </h2>
                    <p className="text-sm mt-2" style={{ color: "#434655" }}>
                      No worries. Enter your work email and we'll send you a reset link.
                    </p>
                  </div>
                  <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    <AuthFieldShell label="Work Email" error={emailError}>
                      <AuthInput
                        id="forgot-email"
                        placeholder="name@company.com"
                        type="email"
                        value={email}
                        invalid={!!emailError}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError)
                            setEmailError(validateEmail(e.target.value, "Work email"));
                        }}
                        onBlur={() => setEmailError(validateEmail(email, "Work email"))}
                      />
                    </AuthFieldShell>
                    <Button
                      variant="primary"
                      size="md"
                      block
                      type="submit"
                      className="h-12 rounded-full"
                    >
                      {sending ? <ButtonSpinner /> : "Send Reset Link"}
                    </Button>
                  </form>
                  <OverlaySpinner show={sending} />
                </>
              )}

              {step === "sent" && (
                <div className="py-4">
                  <div className="mb-10">
                    <div className="relative w-16 h-16 mb-6 mx-auto">
                      <div
                        className="absolute inset-0 rounded-2xl blur-xl opacity-40"
                        style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}
                      ></div>
                      <div
                        className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{
                          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                          boxShadow: "0 10px 25px -5px rgba(34,197,94,0.4)",
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[30px] text-white"
                          style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
                        >
                          mark_email_read
                        </span>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#191c1e" }}>
                      Email Sent!
                    </h2>
                    <p className="text-sm mt-2" style={{ color: "#434655" }}>
                      We've sent a reset link to{" "}
                      <span className="font-bold" style={{ color: "#004AC6" }}>
                        {email}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <span
                      className="material-symbols-outlined text-[18px] animate-spin"
                      style={{ color: "#004AC6" }}
                    >
                      progress_activity
                    </span>
                    <span className="text-[0.8125rem] font-medium" style={{ color: "#737686" }}>
                      Waiting for confirmation...
                    </span>
                  </div>
                  <Button
                    onClick={handleOpenMail}
                    variant="cta"
                    block
                    className="h-12 rounded-full text-white font-bold"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      mail
                    </span>
                    Open Mail
                  </Button>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={handleResend}
                      disabled={resendTimer > 0}
                      className="h-11 font-semibold rounded-full transition-all duration-150 flex items-center justify-center gap-2 text-sm"
                      style={{
                        background: resendTimer > 0 ? "#f0f1f3" : "rgba(0,74,198,0.06)",
                        border: "1px solid rgba(195,198,215,0.3)",
                        color: resendTimer > 0 ? "#737686" : "#004AC6",
                        cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                      {resendTimer > 0 ? `Resend (${resendTimer}s)` : "Resend Link"}
                    </button>
                    <button
                      onClick={handleEditEmail}
                      className="h-11 font-semibold rounded-full transition-all duration-150 flex items-center justify-center gap-2 text-sm hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "rgba(0,74,198,0.06)",
                        border: "1px solid rgba(195,198,215,0.3)",
                        color: "#004AC6",
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Edit Email
                    </button>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowHelp(!showHelp)}
                      className="flex items-center gap-2 mx-auto text-sm font-semibold transition-colors duration-200"
                      style={{ color: "#737686" }}
                    >
                      <span className="material-symbols-outlined text-[18px]">help</span>
                      Didn't receive the email?
                      <span
                        className="material-symbols-outlined text-[16px] transition-transform duration-200"
                        style={{ transform: showHelp ? "rotate(180deg)" : "rotate(0deg)" }}
                      >
                        expand_more
                      </span>
                    </button>
                    {showHelp && (
                      <div
                        className="mt-4 p-4 rounded-xl space-y-3"
                        style={{
                          background: "rgba(0,74,198,0.03)",
                          border: "1px solid rgba(0,74,198,0.08)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="material-symbols-outlined text-[18px] mt-0.5"
                            style={{ color: "#004AC6", fontVariationSettings: "'FILL' 1" }}
                          >
                            folder
                          </span>
                          <p className="text-[0.8125rem]" style={{ color: "#434655" }}>
                            Check your <span className="font-semibold">spam</span> or{" "}
                            <span className="font-semibold">junk</span> folder
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span
                            className="material-symbols-outlined text-[18px] mt-0.5"
                            style={{ color: "#004AC6", fontVariationSettings: "'FILL' 1" }}
                          >
                            schedule
                          </span>
                          <p className="text-[0.8125rem]" style={{ color: "#434655" }}>
                            Wait <span className="font-semibold">1–2 minutes</span> for delivery
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span
                            className="material-symbols-outlined text-[18px] mt-0.5"
                            style={{ color: "#004AC6", fontVariationSettings: "'FILL' 1" }}
                          >
                            verified
                          </span>
                          <p className="text-[0.8125rem]" style={{ color: "#434655" }}>
                            Verify your email address is{" "}
                            <span className="font-semibold">correct</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === "reset" && !success && (
                <>
                  <div className="mb-10">
                    <div className="relative w-16 h-16 mb-6">
                      <div
                        className="absolute inset-0 rounded-2xl blur-xl opacity-40"
                        style={{ background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)" }}
                      ></div>
                      <div
                        className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{
                          background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)",
                          boxShadow: "0 10px 25px -5px rgba(0,74,198,0.35)",
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[30px] text-white"
                          style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
                        >
                          lock
                        </span>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#191c1e" }}>
                      Create New Password
                    </h2>
                    <p className="text-sm mt-2" style={{ color: "#434655" }}>
                      Enter your new password below. Make it strong and memorable.
                    </p>
                  </div>
                  <form className="space-y-6" onSubmit={handleResetSubmit} noValidate>
                    <AuthFieldShell label="New Password" error={passwordError}>
                      <div className="relative">
                        <AuthInput
                          id="new-password"
                          placeholder="Minimum 8 characters"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          invalid={!!passwordError}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (passwordError)
                              setPasswordError(validatePassword(e.target.value, "Password"));
                            if (confirmError)
                              setConfirmError(
                                validatePasswordMatch(e.target.value, confirmPassword),
                              );
                          }}
                          onBlur={() => setPasswordError(validatePassword(password, "Password"))}
                          className="pr-12"
                        />
                        <button
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                          style={{ color: "#737686" }}
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                      {/* Live password strength indicator */}
                      <PasswordStrength value={password} />
                    </AuthFieldShell>
                    <AuthFieldShell label="Confirm Password" error={confirmError}>
                      <div className="relative">
                        <AuthInput
                          id="confirm-password"
                          placeholder="Re-enter your password"
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          invalid={!!confirmError}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (confirmError)
                              setConfirmError(validatePasswordMatch(password, e.target.value));
                          }}
                          onBlur={() =>
                            setConfirmError(validatePasswordMatch(password, confirmPassword))
                          }
                          className="pr-12"
                        />
                        <button
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                          style={{ color: "#737686" }}
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showConfirm ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </AuthFieldShell>
                    {error && (
                      <div
                        className="p-3 rounded-xl flex items-center gap-2"
                        style={{
                          background: "rgba(239,68,68,0.06)",
                          border: "1px solid rgba(239,68,68,0.15)",
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ color: "#ef4444" }}
                        >
                          error
                        </span>
                        <p className="text-[0.8125rem] font-medium" style={{ color: "#ef4444" }}>
                          {error}
                        </p>
                      </div>
                    )}
                    <Button
                      variant="primary"
                      size="md"
                      block
                      type="submit"
                      className="h-12 rounded-full"
                    >
                      {loading ? <ButtonSpinner /> : "Set New Password"}
                    </Button>
                  </form>
                  <OverlaySpinner show={loading} />
                </>
              )}

              {step === "reset" && success && (
                <div className="text-center py-8">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div
                      className="absolute inset-0 rounded-2xl blur-xl opacity-40"
                      style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}
                    ></div>
                    <div
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        boxShadow: "0 10px 25px -5px rgba(34,197,94,0.4)",
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-[30px] text-white"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
                      >
                        check_circle
                      </span>
                    </div>
                  </div>
                  <h2
                    className="text-2xl font-bold tracking-tight mb-2"
                    style={{ color: "#191c1e" }}
                  >
                    Password Updated!
                  </h2>
                  <p
                    className="text-sm leading-relaxed max-w-sm mx-auto"
                    style={{ color: "#434655" }}
                  >
                    Your password has been successfully reset. Redirecting you to sign in...
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <span
                      className="material-symbols-outlined text-[18px] animate-spin"
                      style={{ color: "#004AC6" }}
                    >
                      progress_activity
                    </span>
                    <span className="text-[0.8125rem] font-medium" style={{ color: "#737686" }}>
                      Redirecting...
                    </span>
                  </div>
                </div>
              )}

              <p className="mt-8 text-center text-sm" style={{ color: "#434655" }}>
                Remember your password?{" "}
                <a
                  onClick={() => navigate("/login")}
                  className="font-bold hover:underline decoration-2 underline-offset-4 cursor-pointer"
                  style={{ color: "#004AC6" }}
                >
                  Sign in
                </a>
              </p>
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
      <div className="fixed top-20 right-20 w-32 h-32 opacity-20 hidden lg:block">
        <div
          className="w-full h-full rounded-3xl rotate-12"
          style={{ border: "1px solid rgba(0,74,198,0.4)" }}
        ></div>
      </div>
      <div className="fixed bottom-20 left-20 w-24 h-24 opacity-20 hidden lg:block">
        <div
          className="w-full h-full rounded-full"
          style={{ border: "2px solid rgba(0,74,198,0.2)" }}
        ></div>
      </div>
    </div>
  );
};

const ForgotPasswordWithSpinner = () => {
  const booting = useSkeleton();
  return booting ? <PageSpinner /> : <ForgotPassword />;
};

export default ForgotPasswordWithSpinner;
