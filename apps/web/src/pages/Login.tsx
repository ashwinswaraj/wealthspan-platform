import { useSkeleton, PageSpinner } from "@jobrio/ui/design-system";
import { useNavigate } from "@/lib/react-router-dom";
import { DemoLauncher } from "@/features/auth";
import { SignIn } from "@jobrio/auth";

/** Platform sign-in page — UI lives in @jobrio/auth so admin can reuse it. */
const Login = () => {
  const navigate = useNavigate();
  return <SignIn navigate={navigate} demoLauncher={<DemoLauncher />} />;
};

/**
 * Auth surfaces never use skeletons — they boot behind a spinner.
 */
const LoginWithSpinner = () => {
  const booting = useSkeleton();
  return booting ? <PageSpinner /> : <Login />;
};

export default LoginWithSpinner;
