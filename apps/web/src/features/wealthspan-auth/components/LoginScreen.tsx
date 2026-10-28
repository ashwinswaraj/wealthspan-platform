import { useState } from "react";
import { Button, Input } from "@jobrio/ui/design-system";
import { api, ApiError } from "@/services/api";
import { establishSession } from "@/services/session";

type Step = "email" | "code";

/** Email-code login. (A one-tap magic link can be added later — same /send endpoint, method "link".) */
export function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof ApiError || e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const send = () =>
    run(async () => {
      await api("auth", "/send", { method: "POST", body: { email: email.trim(), method: "otp" } });
      setStep("code");
    });

  const verify = () =>
    run(async () => {
      const { token } = await api<{ token: string }>("auth", "/verify", {
        method: "POST",
        body: { email: email.trim(), method: "otp", secret: code.trim() },
      });
      await establishSession(token);
      onLoggedIn();
    });

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-10 bg-surface">
      <div className="w-full max-w-sm space-y-6">
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
            Wealth<span className="text-outline font-medium">span</span>
          </h1>
          <p className="font-serif text-lg text-on-surface-variant">The full arc of your money</p>
        </header>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void (step === "email" ? send() : verify());
          }}
        >
          {step === "email" ? (
            <>
              <label
                className="text-[10px] font-bold uppercase tracking-wider text-outline"
                htmlFor="login-email"
              >
                Enter your email
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" block disabled={busy || !email.includes("@")}>
                Send code
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-on-surface-variant">
                We sent a 6-digit code to <b className="text-on-surface">{email}</b>.
              </p>
              <Input
                aria-label="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
              <Button type="submit" block disabled={busy || code.length !== 6}>
                Verify & continue
              </Button>
              <Button
                variant="ghost"
                block
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                }}
              >
                Use a different email
              </Button>
            </>
          )}
          {error ? (
            <p role="alert" className="text-xs text-error">
              {error}
            </p>
          ) : null}
        </form>

        <p className="text-center text-xs text-on-surface-variant">
          New here? Your first month of Wealthspan Go is free.
        </p>
      </div>
    </main>
  );
}
