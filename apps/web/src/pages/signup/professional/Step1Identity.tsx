import { IdentityStep } from "@/features/signup";

const PRO_STEPS = [
  { index: 1, label: "Identity" },
  { index: 2, label: "Email Verification" },
  { index: 3, label: "Professional Details" },
  { index: 4, label: "Work Capacity" },
  { index: 5, label: "Identity Verification" },
];

const ProStep1 = () => (
  <IdentityStep
    role="professional"
    totalSteps={5}
    steps={PRO_STEPS}
    nextRoute="/signup/professional/step-2"
  />
);

export default ProStep1;
