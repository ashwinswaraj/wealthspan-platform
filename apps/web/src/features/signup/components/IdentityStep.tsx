import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@/lib/react-router-dom";
import SignupLayout from "./SignupLayout";
import { FieldShell, TextInput, SelectInput } from "./FormField";
import BirthdayPicker from "./BirthdayPicker";
import AvatarCropperModal from "./AvatarCropperModal";
import { loadSignup, saveSignup, type Role } from "@jobrio/auth/signupStorage";

interface IdentityData {
  photo?: string;
  fullName?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  address1?: string;
  address2?: string;
  pincode?: string;
}

interface Props {
  role: Role;
  totalSteps: number;
  steps: { label: string; index: number }[];
  nextRoute: string;
}

const IdentityStep = ({ role, totalSteps, steps, nextRoute }: Props) => {
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

  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<IdentityData>({});
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    setData(loadSignup<IdentityData>(role));
  }, [role]);

  const update = (patch: Partial<IdentityData>) => setData((d) => ({ ...d, ...patch }));

  const onPhoto = (file?: File) => {
    if (!file) return;
    setPendingFile(file);
  };

  const required: (keyof IdentityData)[] = [
    "photo",
    "fullName",
    "dob",
    "gender",
    "phone",
    "email",
    "country",
    "state",
    "city",
    "address1",
    "pincode",
  ];
  const isValid =
    required.every((k) => !!(data[k] && String(data[k]).trim())) &&
    (data.phone ?? "").replace(/\D/g, "").length === 12;

  const handleContinue = () => {
    saveSignup(role, { ...data });
    navigate(nextRoute);
  };

  return (
    <SignupLayout
      role={role}
      currentStep={1}
      totalSteps={totalSteps}
      steps={steps}
      stepTitle="Tell us who you are"
      stepDescription="We use these details to verify your account and personalize your Jobrio experience."
      heroTitle={<>Your identity is your first impression on {gradientSpan("Jobrio.")}</>}
      heroSubtitle="Share your personal details so we can verify your account and tailor your experience from day one."
      onBack={() => navigate("/signup")}
      onContinue={handleContinue}
      continueDisabled={!isValid}
    >
      <div className="space-y-6">
        {/* Photo */}
        <div>
          <span className="block text-sm font-semibold ml-1" style={{ color: "#434655" }}>
            Profile photo
          </span>
          <div className="mt-2 flex items-center gap-5">
            <div
              className="relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{
                background: "rgba(0,74,198,0.06)",
                border: "2px dashed rgba(0,74,198,0.45)",
              }}
              aria-label="Profile photo crop frame"
            >
              {data.photo ? (
                <img src={data.photo} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#004AC6", fontSize: 32 }}
                >
                  person
                </span>
              )}
              {/* Crop frame overlay — circular guide with corner ticks */}
              <span
                aria-hidden
                className="absolute inset-1 rounded-full pointer-events-none"
                style={{
                  border: "1px solid rgba(0,74,198,0.85)",
                  boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.85)",
                }}
              />
              <span
                aria-hidden
                className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 rounded-tl-md"
                style={{ borderColor: "#004AC6" }}
              />
              <span
                aria-hidden
                className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 rounded-tr-md"
                style={{ borderColor: "#004AC6" }}
              />
              <span
                aria-hidden
                className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 rounded-bl-md"
                style={{ borderColor: "#004AC6" }}
              />
              <span
                aria-hidden
                className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 rounded-br-md"
                style={{ borderColor: "#004AC6" }}
              />
            </div>

            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  onPhoto(e.target.files?.[0]);
                  e.currentTarget.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-10 px-4 rounded-full font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.96]"
                style={{
                  background: "rgba(0,74,198,0.08)",
                  color: "#004AC6",
                  border: "1px solid rgba(0,74,198,0.2)",
                }}
              >
                {data.photo ? "Change photo" : "Upload photo"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldShell label="Full name" required>
            <TextInput
              value={data.fullName ?? ""}
              onChange={(e) => update({ fullName: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Date of birth" required>
            <BirthdayPicker value={data.dob} onChange={(iso) => update({ dob: iso })} />
          </FieldShell>
          <FieldShell label="Gender" required>
            <SelectInput
              value={data.gender ?? ""}
              onChange={(e) => update({ gender: e.target.value })}
            >
              <option value=""></option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not">Prefer not to say</option>
            </SelectInput>
          </FieldShell>
          <div className="flex items-stretch gap-2">
            <span
              className="h-12 px-3 rounded-xl flex items-center gap-1.5 text-sm font-semibold shrink-0"
              style={{ background: "#ffffff", border: "1px solid #c3c6d7", color: "#191c1e" }}
            >
              <span aria-hidden>🇮🇳</span> +91
            </span>
            <FieldShell label="Phone number" required className="flex-1 min-w-0">
              <TextInput
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={(data.phone ?? "").replace(/^\+91\s?/, "")}
                onChange={(e) =>
                  update({ phone: `+91 ${e.target.value.replace(/\D/g, "").slice(0, 10)}`.trim() })
                }
              />
            </FieldShell>
          </div>
          <FieldShell label="Contact email" required className="md:col-span-2">
            <TextInput
              type="email"
              value={data.email ?? ""}
              onChange={(e) => update({ email: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Country" required>
            <TextInput
              value={data.country ?? ""}
              onChange={(e) => update({ country: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="State" required>
            <TextInput
              value={data.state ?? ""}
              onChange={(e) => update({ state: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="City" required>
            <TextInput value={data.city ?? ""} onChange={(e) => update({ city: e.target.value })} />
          </FieldShell>
          <FieldShell label="Pincode" required>
            <TextInput
              value={data.pincode ?? ""}
              onChange={(e) => update({ pincode: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Address line 1" required className="md:col-span-2">
            <TextInput
              value={data.address1 ?? ""}
              onChange={(e) => update({ address1: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Address line 2" className="md:col-span-2">
            <TextInput
              value={data.address2 ?? ""}
              onChange={(e) => update({ address2: e.target.value })}
            />
          </FieldShell>
        </div>
      </div>
      <AvatarCropperModal
        open={!!pendingFile}
        file={pendingFile}
        onCancel={() => setPendingFile(null)}
        onSave={(dataUrl) => {
          update({ photo: dataUrl });
          setPendingFile(null);
        }}
      />
    </SignupLayout>
  );
};

export default IdentityStep;
