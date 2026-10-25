import { VerificationStep } from "@/features/signup";

const PRO_STEPS = [
  { index: 1, label: "Identity" },
  { index: 2, label: "Email Verification" },
  { index: 3, label: "Professional Details" },
  { index: 4, label: "Work Capacity" },
  { index: 5, label: "Identity Verification" },
];

const ProStep2 = () => (
  <VerificationStep
    role="professional"
    totalSteps={5}
    steps={PRO_STEPS}
    backRoute="/signup/professional/step-1"
    nextRoute="/signup/professional/step-3"
  />
);

export default ProStep2;
