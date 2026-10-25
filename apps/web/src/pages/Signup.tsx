import { useSkeleton, PageSpinner } from "@jobrio/ui/design-system";
import { useNavigate } from "@/lib/react-router-dom";
import { DemoLauncher } from "@/features/auth";
import { SignUp } from "@jobrio/auth";

/** Platform sign-up entry page — UI lives in @jobrio/auth so admin can reuse it. */
const Signup = () => {
  const navigate = useNavigate();
  return <SignUp navigate={navigate} demoLauncher={<DemoLauncher />} />;
};

/** Auth surfaces never use skeletons — they boot behind a spinner. */
const SignupWithSpinner = () => {
  const booting = useSkeleton();
  return booting ? <PageSpinner /> : <Signup />;
};

export default SignupWithSpinner;
