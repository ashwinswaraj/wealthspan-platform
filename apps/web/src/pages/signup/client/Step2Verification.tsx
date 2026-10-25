import { VerificationStep } from "@/features/signup";

const CLIENT_STEPS = [
  { index: 1, label: "Identity" },
  { index: 2, label: "Verification" },
  { index: 3, label: "Client Type" },
  { index: 4, label: "Billing Details" },
];

const ClientStep2 = () => (
  <VerificationStep
    role="client"
    totalSteps={4}
    steps={CLIENT_STEPS}
    backRoute="/signup/client/step-1"
    nextRoute="/signup/client/step-3"
  />
);

export default ClientStep2;
