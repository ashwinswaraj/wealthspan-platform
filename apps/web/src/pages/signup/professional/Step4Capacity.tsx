import { SignupLayout, FieldShell, TextInput, SelectInput } from "@/features/signup";
import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/react-router-dom";
import { loadSignup, saveSignup } from "@jobrio/auth/signupStorage";

const PRO_STEPS = [
  { index: 1, label: "Identity" },
  { index: 2, label: "Email Verification" },
  { index: 3, label: "Professional Details" },
  { index: 4, label: "Work Capacity" },
  { index: 5, label: "Identity Verification" },
];

interface CapacityData {
  dailyHours?: string;
  weeklyCapacity?: string;
  expectedPayout?: string;
}

const ProStep4 = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<CapacityData>({});

  useEffect(() => {
    setData(loadSignup<CapacityData>("professional"));
  }, []);

  const update = (patch: Partial<CapacityData>) => setData((d) => ({ ...d, ...patch }));

  const isValid = !!(data.dailyHours?.trim() && data.weeklyCapacity?.trim());

  const handleContinue = () => {
    saveSignup("professional", { ...data });
    navigate("/signup/professional/step-5");
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
      role="professional"
      currentStep={4}
      totalSteps={5}
      steps={PRO_STEPS}
      stepTitle="Work capacity"
      stepDescription="Help us understand your availability and rate expectations."
      heroTitle={<>Define your availability on {gradientSpan("Jobrio.")}</>}
      heroSubtitle="Let us know your working hours and rate expectations so we can find the perfect fit for you."
      onBack={() => navigate("/signup/professional/step-3")}
      onContinue={handleContinue}
      continueDisabled={!isValid}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldShell label="Daily working hours" required>
          <SelectInput
            value={data.dailyHours ?? ""}
            onChange={(e) => update({ dailyHours: e.target.value })}
          >
            <option value=""></option>
            <option value="1-3">1–3 hours</option>
            <option value="4-6">4–6 hours</option>
            <option value="6-8">6–8 hours</option>
            <option value="8+">8+ hours</option>
          </SelectInput>
        </FieldShell>
        <FieldShell label="Weekly capacity" required>
          <SelectInput
            value={data.weeklyCapacity ?? ""}
            onChange={(e) => update({ weeklyCapacity: e.target.value })}
          >
            <option value=""></option>
            <option value="<10">Less than 10 hours / week</option>
            <option value="10-20">10–20 hours / week</option>
            <option value="20-30">20–30 hours / week</option>
            <option value="30-40">30–40 hours / week</option>
            <option value="40+">40+ hours / week</option>
          </SelectInput>
        </FieldShell>
        <FieldShell
          label="Expected payout"
          className="md:col-span-2"
          hint="Hourly or monthly — your preferred currency."
        >
          <TextInput
            value={data.expectedPayout ?? ""}
            onChange={(e) => update({ expectedPayout: e.target.value })}
          />
        </FieldShell>
      </div>
    </SignupLayout>
  );
};

export default ProStep4;
