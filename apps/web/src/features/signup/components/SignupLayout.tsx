import { ReactNode } from "react";
import { useNavigate } from "@/lib/react-router-dom";
import { LogoBriefcase } from "@jobrio/ui/shared/LogoBriefcase";
import { Button, OverlaySpinner, ButtonSpinner } from "@jobrio/ui/design-system";

interface Step {
  label: string;
  index: number;
}

interface SignupLayoutProps {
  role: "client" | "professional";
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepDescription: string;
  steps: Step[];
  children: ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  /**
   * Only the FINAL step of a signup flow passes this. Intermediate steps
   * navigate instantly and must never show a spinner.
   */
  submitting?: boolean;
  submittingLabel?: string;
  heroTitle?: ReactNode;
  heroSubtitle?: string;
}

const SignupLayout = ({
  role,
  currentStep,
  totalSteps,
  stepTitle,
  stepDescription,
  steps,
  children,
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
  submitting = false,
  submittingLabel = "Creating your account…",
  heroTitle: heroTitleProp,
  heroSubtitle: heroSubtitleProp,
}: SignupLayoutProps) => {
  const navigate = useNavigate();
  const progress = (currentStep / totalSteps) * 100;

  const gradientSpan = (text: string) => (
    <span
      style={{
        background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {text}
    </span>
  );

  const defaultHeroTitle =
    role === "client" ? (
      <>Hire world-class talent with {gradientSpan("Jobrio.")}</>
    ) : (
      <>Land elite projects with {gradientSpan("Jobrio.")}</>
    );

  const defaultHeroSubtitle =
    role === "client"
      ? "Access a verified network of elite professionals to scale your projects faster."
      : "Join the future of managed work and connect with high-impact opportunities from top-tier enterprises.";

  const heroTitle = heroTitleProp ?? defaultHeroTitle;
  const heroSubtitle = heroSubtitleProp ?? defaultHeroSubtitle;

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

        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
          {/* Left: Branding */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-12">
            <div>
              <button
                onClick={() => (onBack ? onBack() : navigate("/signup"))}
                className="flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-80 hover:scale-[1.02] active:scale-[0.98] mb-5"
                style={{ color: "#434655" }}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Previous
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
                className="text-[2.25rem] md:text-[3rem] font-bold leading-[1.1] tracking-tight"
                style={{ color: "#191c1e" }}
              >
                {heroTitle}
              </h1>
              <p className="text-[1.125rem] max-w-md leading-relaxed" style={{ color: "#434655" }}>
                {heroSubtitle}
              </p>
            </div>

            {/* Step indicator (vertical) on desktop */}
            <div
              className="hidden lg:block pt-6"
              style={{ borderTop: "1px solid rgba(195,198,215,0.3)" }}
            >
              <p
                className="text-[0.6875rem] font-semibold uppercase tracking-wider mb-4"
                style={{ color: "#737686" }}
              >
                {role === "client" ? "Client Application" : "Professional Application"}
              </p>
              <ol className="space-y-3">
                {steps.map((s) => {
                  const done = s.index < currentStep;
                  const active = s.index === currentStep;
                  return (
                    <li key={s.index} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: done
                            ? "#004AC6"
                            : active
                              ? "rgba(0,74,198,0.12)"
                              : "rgba(195,198,215,0.25)",
                          color: done ? "#ffffff" : active ? "#004AC6" : "#737686",
                          border: active ? "1px solid #004AC6" : "none",
                        }}
                      >
                        {done ? "✓" : s.index}
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: active ? "#191c1e" : done ? "#434655" : "#737686",
                          fontWeight: active ? 700 : 500,
                        }}
                      >
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Right: Step Card */}
          <div className="lg:col-span-7">
            <div
              className="relative rounded-2xl p-8 md:p-10"
              style={{
                background: "#ffffff",
                boxShadow: "0 24px 48px rgba(15,23,42,0.06)",
                border: "1px solid rgba(195,198,215,0.3)",
              }}
            >
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[0.6875rem] font-bold uppercase tracking-widest"
                    style={{ color: "#737686" }}
                  >
                    Step {currentStep} of {totalSteps}
                  </span>
                  <span
                    className="text-[0.6875rem] font-bold uppercase tracking-widest"
                    style={{ color: "#004AC6" }}
                  >
                    {Math.round(progress)}% complete
                  </span>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(195,198,215,0.3)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background:
                        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-container)) 100%)",
                    }}
                  />
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#191c1e" }}>
                  {stepTitle}
                </h2>
                <p className="text-sm mt-2" style={{ color: "#434655" }}>
                  {stepDescription}
                </p>
              </div>

              {children}

              {onContinue && (
                <div className="mt-10 flex justify-center">
                  <Button
                    onClick={() => {
                      if (continueDisabled || submitting) return;
                      onContinue();
                    }}
                    variant="primary"
                    size="md"
                    className="h-12 rounded-full px-8"
                  >
                    {submitting ? <ButtonSpinner /> : continueLabel}
                  </Button>
                </div>
              )}
              <OverlaySpinner show={submitting} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignupLayout;
