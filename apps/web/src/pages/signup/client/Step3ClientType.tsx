import { SignupLayout, FieldShell, TextInput, SelectInput } from "@/features/signup";
import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/react-router-dom";
import { loadSignup, saveSignup } from "@jobrio/auth/signupStorage";

const CLIENT_STEPS = [
  { index: 1, label: "Identity" },
  { index: 2, label: "Verification" },
  { index: 3, label: "Client Type" },
  { index: 4, label: "Billing Details" },
];

interface ClientTypeData {
  clientType?: "individual" | "company";
  companyName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  linkedin?: string;
}

const ClientStep3 = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ClientTypeData>({});

  useEffect(() => {
    setData(loadSignup<ClientTypeData>("client"));
  }, []);

  const update = (patch: Partial<ClientTypeData>) => setData((d) => ({ ...d, ...patch }));

  const isCompany = data.clientType === "company";
  const isIndividual = data.clientType === "individual";

  const isValid =
    !!data.clientType &&
    (isIndividual ||
      (isCompany &&
        !!data.companyName?.trim() &&
        !!data.industry?.trim() &&
        !!data.companySize?.trim() &&
        !!data.website?.trim() &&
        !!data.linkedin?.trim()));

  const handleContinue = () => {
    saveSignup("client", { ...data });
    navigate("/signup/client/step-4");
  };

  const TypeCard = ({
    value,
    icon,
    title,
    desc,
  }: {
    value: "individual" | "company";
    icon: string;
    title: string;
    desc: string;
  }) => {
    const active = data.clientType === value;
    return (
      <div className="relative cursor-pointer" onClick={() => update({ clientType: value })}>
        {active && (
          <div
            className="absolute -inset-1 rounded-2xl blur opacity-100"
            style={{
              background: "linear-gradient(to right, rgba(0,74,198,0.3), rgba(59,130,246,0.3))",
            }}
          ></div>
        )}
        <div
          className="relative p-5 rounded-2xl"
          style={{
            background: "#ffffff",
            border: active ? "2px solid #004AC6" : "1px solid rgba(195,198,215,0.3)",
            transform: active ? "translateY(-3px)" : "translateY(0)",
            boxShadow: active ? "0 0 25px rgba(37,99,235,0.15)" : "none",
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
            style={{ background: active ? "#004AC6" : "rgba(37,99,235,0.1)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                color: active ? "#ffffff" : "#004AC6",
                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {icon}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-base" style={{ color: "#191c1e", fontWeight: active ? 700 : 600 }}>
              {title}
            </h3>
            {active && (
              <span
                className="material-symbols-outlined text-sm"
                style={{ color: "#004AC6", fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: "#434655" }}>
            {desc}
          </p>
        </div>
      </div>
    );
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
      role="client"
      currentStep={3}
      totalSteps={4}
      steps={CLIENT_STEPS}
      stepTitle="What type of client are you?"
      stepDescription="This helps us tailor billing, contracts and onboarding flows."
      heroTitle={<>Tell us how you hire on {gradientSpan("Jobrio.")}</>}
      heroSubtitle="Whether you're an individual or a company, we'll customize contracts, billing, and onboarding for you."
      onBack={() => navigate("/signup/client/step-2")}
      onContinue={handleContinue}
      continueDisabled={!isValid}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TypeCard
            value="individual"
            icon="person"
            title="Individual"
            desc="Hiring on your own behalf or for personal projects."
          />
          <TypeCard
            value="company"
            icon="business_center"
            title="Company"
            desc="Hiring on behalf of an organisation or team."
          />
        </div>

        {data.clientType && (
          <div className="space-y-5">
            <p
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#737686" }}
            >
              {isCompany ? "Company details" : "Optional links"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {isCompany && (
                <>
                  <FieldShell label="Company name" required className="md:col-span-2">
                    <TextInput
                      value={data.companyName ?? ""}
                      onChange={(e) => update({ companyName: e.target.value })}
                    />
                  </FieldShell>
                  <FieldShell label="Industry" required>
                    <TextInput
                      value={data.industry ?? ""}
                      onChange={(e) => update({ industry: e.target.value })}
                    />
                  </FieldShell>
                  <FieldShell label="Company size" required>
                    <SelectInput
                      value={data.companySize ?? ""}
                      onChange={(e) => update({ companySize: e.target.value })}
                    >
                      <option value=""></option>
                      <option value="1-10">1–10</option>
                      <option value="11-50">11–50</option>
                      <option value="51-200">51–200</option>
                      <option value="201-500">201–500</option>
                      <option value="501-1000">501–1,000</option>
                      <option value="1000+">1,000+</option>
                    </SelectInput>
                  </FieldShell>
                </>
              )}
              <FieldShell label="Website" required={isCompany}>
                <TextInput
                  value={data.website ?? ""}
                  onChange={(e) => update({ website: e.target.value })}
                />
              </FieldShell>
              <FieldShell label="LinkedIn" required={isCompany}>
                <TextInput
                  value={data.linkedin ?? ""}
                  onChange={(e) => update({ linkedin: e.target.value })}
                />
              </FieldShell>
            </div>
          </div>
        )}
      </div>
    </SignupLayout>
  );
};

export default ClientStep3;
