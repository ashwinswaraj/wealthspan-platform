import { useNavigate } from "@admin/lib/react-router-dom";
import { SignIn } from "@jobrio/auth";

/**
 * Admin auth page — thin wrapper around the shared @jobrio/auth UI.
 * Admins sign in through the same single auth surface as the platform.
 */
const AdminAuthPage = () => {
  const navigate = useNavigate();
  return <SignIn navigate={navigate} />;
};

export default AdminAuthPage;
