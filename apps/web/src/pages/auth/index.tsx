import { useNavigate } from "@/lib/react-router-dom";
import { DemoLauncher } from "@/features/auth";
import { SignIn, SignUp } from "@jobrio/auth";

export interface AuthPageProps {
  /** Which side of the single auth surface to render. */
  mode?: "signin" | "signup";
}

/** Platform auth page — thin wrapper around the shared @jobrio/auth UI. */
const AuthPage = ({ mode = "signin" }: AuthPageProps) => {
  const navigate = useNavigate();
  return mode === "signup" ? (
    <SignUp navigate={navigate} demoLauncher={<DemoLauncher />} />
  ) : (
    <SignIn navigate={navigate} demoLauncher={<DemoLauncher />} />
  );
};

export default AuthPage;
