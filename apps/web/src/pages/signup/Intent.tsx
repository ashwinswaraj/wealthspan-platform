import { useState } from "react";
import { useNavigate } from "@/lib/react-router-dom";
import { LogoBriefcase } from "@jobrio/ui/shared/LogoBriefcase";
import { Button, OverlaySpinner, ButtonSpinner } from "@jobrio/ui/design-system";

const Intent = () => {
  const [intent, setIntent] = useState<"hire" | "execute" | null>(null);
  const [continuing, setContinuing] = useState(false);
  const navigate = useNavigate();

  /** Intent selection uses a spinner (never a skeleton) while routing onward. */
  const handleContinue = async () => {
    if (!intent || continuing) return;
    setContinuing(true);
    await new Promise((r) => setTimeout(r, 600));
    if (intent === "hire") navigate("/signup/client/step-1");
    else navigate("/signup/professional/step-1");
  };

  const heroTitle =
    intent === "hire" ? (
      <>
        Hire world-class talent with{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Jobrio.
        </span>
      </>
    ) : intent === "execute" ? (
      <>
        Land elite projects with{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Jobrio.
        </span>
      </>
    ) : (
      <>
        Choose how you want to use{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Jobrio.
        </span>
      </>
    );

  const heroSubtitle =
    intent === "hire"
      ? "Access a verified network of elite professionals to scale your projects faster."
      : intent === "execute"
        ? "Join the future of managed work and connect with high-impact opportunities from top-tier enterprises."
        : "Tell us why you're here so we can tailor the next steps for you.";

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
                onClick={() => navigate("/signup")}
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
                {heroTitle}
              </h1>
              <p className="text-[1.125rem] max-w-md leading-relaxed" style={{ color: "#434655" }}>
                {heroSubtitle}
              </p>
            </div>

            <div
              className="hidden lg:block pt-8"
              style={{ borderTop: "1px solid rgba(195,198,215,0.3)" }}
            >
              <p
                className="text-[0.6875rem] font-semibold uppercase tracking-wider"
                style={{ color: "#737686" }}
              >
                {intent === "hire"
                  ? "TRUSTED BY 2,000+ ENTERPRISES"
                  : intent === "execute"
                    ? "TRUSTED BY 2,000+ PROFESSIONALS"
                    : "TRUSTED BY 2,000+ ENTERPRISES & PROFESSIONALS"}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              className="relative rounded-2xl p-8 md:p-10"
              style={{
                background: "#ffffff",
                boxShadow: "0 24px 48px rgba(15,23,42,0.06)",
                border: "1px solid rgba(195,198,215,0.1)",
              }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#191c1e" }}>
                  Select your intent
                </h2>
                <p className="text-sm mt-2" style={{ color: "#434655" }}>
                  Pick what brings you to Jobrio. We'll personalize your onboarding accordingly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="group relative cursor-pointer" onClick={() => setIntent("hire")}>
                  {intent === "hire" && (
                    <div
                      className="absolute -inset-1 rounded-2xl blur opacity-100"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(0,74,198,0.3), rgba(59,130,246,0.3))",
                      }}
                    ></div>
                  )}
                  <div
                    className="relative p-6 rounded-2xl"
                    style={{
                      background: "#ffffff",
                      border:
                        intent === "hire" ? "2px solid #004AC6" : "1px solid rgba(195,198,215,0.2)",
                      transform: intent === "hire" ? "translateY(-4px)" : "translateY(0)",
                      boxShadow:
                        intent === "hire"
                          ? "0 0 25px rgba(37,99,235,0.15), 0 10px 40px rgba(15,23,42,0.04)"
                          : "none",
                      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: intent === "hire" ? "#004AC6" : "rgba(37,99,235,0.1)",
                        transition: "all 0.4s",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          color: intent === "hire" ? "#ffffff" : "#004AC6",
                          fontVariationSettings:
                            intent === "hire" ? "'FILL' 1, 'wght' 700, 'GRAD' 200" : "'FILL' 0",
                        }}
                      >
                        business_center
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <h3
                        className="text-lg"
                        style={{ color: "#191c1e", fontWeight: intent === "hire" ? 700 : 600 }}
                      >
                        I want to hire
                      </h3>
                      {intent === "hire" && (
                        <span
                          className="material-symbols-outlined text-sm"
                          style={{
                            color: "#004AC6",
                            fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 200",
                          }}
                        >
                          check_circle
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1" style={{ color: "#434655" }}>
                      Scale your team with verified elite professionals.
                    </p>
                  </div>
                </div>

                <div className="group relative cursor-pointer" onClick={() => setIntent("execute")}>
                  {intent === "execute" && (
                    <div
                      className="absolute -inset-1 rounded-2xl blur opacity-100"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(0,74,198,0.3), rgba(59,130,246,0.3))",
                      }}
                    ></div>
                  )}
                  <div
                    className="relative p-6 rounded-2xl"
                    style={{
                      background: "#ffffff",
                      border:
                        intent === "execute"
                          ? "2px solid #004AC6"
                          : "1px solid rgba(195,198,215,0.2)",
                      transform: intent === "execute" ? "translateY(-4px)" : "translateY(0)",
                      boxShadow:
                        intent === "execute"
                          ? "0 0 25px rgba(37,99,235,0.25), 0 10px 40px rgba(15,23,42,0.08)"
                          : "none",
                      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: intent === "execute" ? "#004AC6" : "rgba(37,99,235,0.1)",
                        transition: "all 0.4s",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          color: intent === "execute" ? "#ffffff" : "#004AC6",
                          fontVariationSettings:
                            intent === "execute" ? "'FILL' 1, 'wght' 700, 'GRAD' 200" : "'FILL' 0",
                        }}
                      >
                        engineering
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <h3
                        className="text-lg"
                        style={{ color: "#191c1e", fontWeight: intent === "execute" ? 700 : 600 }}
                      >
                        I want to execute
                      </h3>
                      {intent === "execute" && (
                        <span
                          className="material-symbols-outlined text-sm"
                          style={{
                            color: "#004AC6",
                            fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 200",
                          }}
                        >
                          check_circle
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1" style={{ color: "#434655" }}>
                      Join the network and manage high-impact projects.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (!intent || continuing) return;
                  handleContinue();
                }}
                variant="primary"
                size="md"
                block
                className="h-12 rounded-full"
              >
                {continuing ? <ButtonSpinner /> : "Continue"}
              </Button>

              <p className="mt-8 text-center text-sm" style={{ color: "#434655" }}>
                Changed your mind?{" "}
                <a
                  onClick={() => navigate("/signup")}
                  className="font-bold hover:underline decoration-2 underline-offset-4 cursor-pointer"
                  style={{ color: "#004AC6" }}
                >
                  Back to sign up
                </a>
              </p>
              <OverlaySpinner show={continuing} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Intent;
