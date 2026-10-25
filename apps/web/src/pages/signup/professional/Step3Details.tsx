import { SignupLayout, FieldShell, TextInput, SelectInput, TextareaInput } from "@/features/signup";
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

interface ProDetailsData {
  primaryCategory?: string;
  secondaryServices?: string;
  subCategory?: string;
  skills?: string;
  experience?: string;
  bio?: string;
  portfolio?: string;
  linkedin?: string;
}

const ProStep3 = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ProDetailsData>({});

  useEffect(() => {
    setData(loadSignup<ProDetailsData>("professional"));
  }, []);

  const update = (patch: Partial<ProDetailsData>) => setData((d) => ({ ...d, ...patch }));

  const isValid = !!(
    data.primaryCategory?.trim() &&
    data.subCategory?.trim() &&
    data.skills?.trim() &&
    data.experience?.trim() &&
    data.bio?.trim()
  );

  const handleContinue = () => {
    saveSignup("professional", { ...data });
    navigate("/signup/professional/step-4");
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
      currentStep={3}
      totalSteps={5}
      steps={PRO_STEPS}
      stepTitle="Your professional profile"
      stepDescription="Tell us about your craft so we can match you to the right opportunities."
      heroTitle={<>Showcase your expertise on {gradientSpan("Jobrio.")}</>}
      heroSubtitle="Share your skills, experience, and portfolio so we can match you with the right high-impact opportunities."
      onBack={() => navigate("/signup/professional/step-2")}
      onContinue={handleContinue}
      continueDisabled={!isValid}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldShell label="Primary category" required>
            <SelectInput
              value={data.primaryCategory ?? ""}
              onChange={(e) => update({ primaryCategory: e.target.value })}
            >
              <option value=""></option>
              <option value="design">Design</option>
              <option value="engineering">Engineering</option>
              <option value="marketing">Marketing</option>
              <option value="content">Content & Editorial</option>
              <option value="data">Data & AI</option>
              <option value="consulting">Strategy & Consulting</option>
              <option value="ops">Operations</option>
            </SelectInput>
          </FieldShell>
          <FieldShell label="Sub-category" required>
            <TextInput
              value={data.subCategory ?? ""}
              onChange={(e) => update({ subCategory: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Secondary services" className="md:col-span-2">
            <TextInput
              value={data.secondaryServices ?? ""}
              onChange={(e) => update({ secondaryServices: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Skills" required className="md:col-span-2">
            <TextInput
              value={data.skills ?? ""}
              onChange={(e) => update({ skills: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Experience" required>
            <SelectInput
              value={data.experience ?? ""}
              onChange={(e) => update({ experience: e.target.value })}
            >
              <option value=""></option>
              <option value="0-2">0–2 years</option>
              <option value="3-5">3–5 years</option>
              <option value="6-10">6–10 years</option>
              <option value="10+">10+ years</option>
            </SelectInput>
          </FieldShell>
          <FieldShell label="Portfolio">
            <TextInput
              value={data.portfolio ?? ""}
              onChange={(e) => update({ portfolio: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="LinkedIn" className="md:col-span-2">
            <TextInput
              value={data.linkedin ?? ""}
              onChange={(e) => update({ linkedin: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Professional bio" required className="md:col-span-2">
            <TextareaInput
              rows={4}
              value={data.bio ?? ""}
              onChange={(e) => update({ bio: e.target.value })}
            />
          </FieldShell>
        </div>
      </div>
    </SignupLayout>
  );
};

export default ProStep3;
