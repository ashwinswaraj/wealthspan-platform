import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/react-router-dom";
import SignupLayout from "./SignupLayout";
import { loadSignup, saveSignup, type Role } from "@jobrio/auth/signupStorage";
import { Button } from "@jobrio/ui/design-system";

interface Props {
  role: Role;
  totalSteps: number;
  steps: { label: string; index: number }[];
  backRoute: string;
  nextRoute: string;
}

const VerificationStep = ({ role, totalSteps, steps, backRoute, nextRoute }: Props) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const data = loadSignup<{ email?: string; emailVerified?: boolean }>(role);
    setEmail(data.email ?? "");
    setVerified(!!data.emailVerified);
  }, [role]);

  const sendLink = () => {
    setSent(true);
  };

  const simulateVerify = () => {
    setVerified(true);
    saveSignup(role, { emailVerified: true });
  };

  const handleContinue = () => {
    if (!verified) return;
    navigate(nextRoute);
  };

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

  return (
    <SignupLayout
      role={role}
      currentStep={2}
      totalSteps={totalSteps}
      steps={steps}
      stepTitle="Verify your email"
      stepDescription="We'll send a secure magic link to confirm it's really you."
      heroTitle={<>Secure your account on {gradientSpan("Jobrio.")}</>}
      heroSubtitle="A quick email verification keeps your account safe and the network trusted."
      onBack={() => navigate(backRoute)}
      onContinue={handleContinue}
      continueDisabled={!verified}
    >
      <div className="space-y-6">
        <div
          className="rounded-2xl p-6"
          style={{ background: "rgba(0,74,198,0.04)", border: "1px solid rgba(0,74,198,0.12)" }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#004AC6" }}
            >
              <span
                className="material-symbols-outlined text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mail
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "#191c1e" }}>
                Magic link verification
              </p>
              <p className="text-sm mt-1" style={{ color: "#434655" }}>
                We'll email a one-tap login link to <strong>{email || "your address"}</strong>. Open
                it on this device to confirm.
              </p>
            </div>
          </div>
        </div>

        {!sent ? (
          <Button
            onClick={() => {
              if (!email) return;
              sendLink();
            }}
            variant="primary"
            size="md"
            block
            className="h-12 rounded-full"
          >
            Send magic link
          </Button>
        ) : (
          <div className="space-y-4">
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#16a34a", fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <p className="text-sm font-medium" style={{ color: "#15803d" }}>
                Magic link sent. Check your inbox and spam folder.
              </p>
            </div>

            {!verified ? (
              <Button
                onClick={simulateVerify}
                variant="secondary"
                size="md"
                block
                className="h-12 rounded-full"
              >
                I've verified my email
              </Button>
            ) : (
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{
                  background: "rgba(0,74,198,0.06)",
                  border: "1px solid rgba(0,74,198,0.2)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#004AC6", fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <p className="text-sm font-semibold" style={{ color: "#004AC6" }}>
                  Email verified — you're good to continue.
                </p>
              </div>
            )}

            <Button onClick={sendLink} variant="ghost" size="md" block className="rounded-full">
              Resend magic link
            </Button>
          </div>
        )}
      </div>
    </SignupLayout>
  );
};

export default VerificationStep;
