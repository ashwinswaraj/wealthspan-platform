import { IdentityStep } from "@/features/signup";

const CLIENT_STEPS = [
  { index: 1, label: "Identity" },
  { index: 2, label: "Verification" },
  { index: 3, label: "Client Type" },
  { index: 4, label: "Billing Details" },
];

const ClientStep1 = () => (
  <IdentityStep
    role="client"
    totalSteps={4}
    steps={CLIENT_STEPS}
    nextRoute="/signup/client/step-2"
  />
);

export default ClientStep1;
