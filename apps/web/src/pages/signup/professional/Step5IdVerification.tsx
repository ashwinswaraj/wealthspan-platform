import { SignupLayout, FieldShell, TextInput, SelectInput } from "@/features/signup";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@/lib/react-router-dom";
import { clearSignup, loadSignup, saveSignup } from "@jobrio/auth/signupStorage";

const PRO_STEPS = [
  { index: 1, label: "Identity" },
  { index: 2, label: "Email Verification" },
  { index: 3, label: "Professional Details" },
  { index: 4, label: "Work Capacity" },
  { index: 5, label: "Identity Verification" },
];

interface IdVerifyData {
  nationality?: string;
  idType?: string;
  idNumber?: string;
  idUploadName?: string;
  idUpload?: string;
  certificationsName?: string;
  certifications?: string;
  acceptTerms?: boolean;
  acceptPrivacy?: boolean;
  acceptTos?: boolean;
}

const ProStep5 = () => {
  const navigate = useNavigate();
  const idRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<IdVerifyData>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setData(loadSignup<IdVerifyData>("professional"));
  }, []);

  const update = (patch: Partial<IdVerifyData>) => setData((d) => ({ ...d, ...patch }));

  const onFile = (file: File | undefined, key: "idUpload" | "certifications") => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      update({
        [key]: reader.result as string,
        [`${key}Name`]: file.name,
      } as Partial<IdVerifyData>);
    reader.readAsDataURL(file);
  };

  const isValid = !!(
    data.nationality?.trim() &&
    data.idType?.trim() &&
    data.idNumber?.trim() &&
    data.idUpload &&
    data.acceptTerms &&
    data.acceptPrivacy &&
    data.acceptTos
  );

  // Final step only — this is where the spinner appears.
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    saveSignup("professional", { ...data, completedAt: new Date().toISOString() });
    clearSignup("professional");
    await new Promise((r) => setTimeout(r, 900));
    navigate("/login");
  };

  const Checkbox = ({
    id,
    checked,
    onChange,
    children,
  }: {
    id: string;
    checked?: boolean;
    onChange: (v: boolean) => void;
    children: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded cursor-pointer mt-0.5"
        style={{ accentColor: "#004AC6" }}
      />
      <label
        htmlFor={id}
        className="text-sm font-medium cursor-pointer"
        style={{ color: "#434655" }}
      >
        {children}
      </label>
    </div>
  );

  const FileBlock = ({
    label,
    fileName,
    onClick,
  }: {
    label: string;
    required?: boolean;
    fileName?: string;
    onClick: () => void;
  }) => (
    <div>
      <span className="block text-sm font-semibold ml-1" style={{ color: "#434655" }}>
        {label}
      </span>
      <button
        type="button"
        onClick={onClick}
        className="mt-2 w-full rounded-full px-4 py-4 flex items-center justify-between transition-all duration-300 hover:scale-[1.01]"
        style={{
          background: "#ffffff",
          border: "1px dashed rgba(0,74,198,0.35)",
          color: "#191c1e",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined" style={{ color: "#004AC6" }}>
            upload_file
          </span>
          <span className="text-sm font-medium" style={{ color: fileName ? "#191c1e" : "#737686" }}>
            {fileName ?? "Click to upload"}
          </span>
        </div>
        {fileName && (
          <span
            className="material-symbols-outlined text-sm"
            style={{ color: "#16a34a", fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        )}
      </button>
    </div>
  );

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
      currentStep={5}
      totalSteps={5}
      steps={PRO_STEPS}
      stepTitle="Identity verification"
      stepDescription="Upload a valid government ID. This is a one-time verification to keep the network trusted."
      heroTitle={<>Verify your identity on {gradientSpan("Jobrio.")}</>}
      heroSubtitle="A one-time government ID check keeps our professional network trusted, secure, and credible."
      onBack={() => navigate("/signup/professional/step-4")}
      onContinue={handleSubmit}
      continueDisabled={!isValid}
      continueLabel="Submit application"
      submitting={submitting}
      submittingLabel="Submitting your application…"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldShell label="Nationality" required>
            <TextInput
              value={data.nationality ?? ""}
              onChange={(e) => update({ nationality: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="ID type" required>
            <SelectInput
              value={data.idType ?? ""}
              onChange={(e) => update({ idType: e.target.value })}
            >
              <option value=""></option>
              <option value="passport">Passport</option>
              <option value="aadhaar">Aadhaar</option>
              <option value="driving-license">Driving License</option>
              <option value="national-id">National ID</option>
              <option value="voter-id">Voter ID</option>
            </SelectInput>
          </FieldShell>
          <FieldShell label="ID number" required className="md:col-span-2">
            <TextInput
              value={data.idNumber ?? ""}
              onChange={(e) => update({ idNumber: e.target.value })}
            />
          </FieldShell>
        </div>

        <input
          ref={idRef}
          type="file"
          hidden
          accept="image/*,application/pdf"
          onChange={(e) => onFile(e.target.files?.[0], "idUpload")}
        />
        <input
          ref={certRef}
          type="file"
          hidden
          accept="image/*,application/pdf"
          onChange={(e) => onFile(e.target.files?.[0], "certifications")}
        />

        <FileBlock
          label="ID upload"
          required
          fileName={data.idUploadName}
          onClick={() => idRef.current?.click()}
        />
        <FileBlock
          label="Certifications"
          fileName={data.certificationsName}
          onClick={() => certRef.current?.click()}
        />

        <div className="space-y-3">
          <Checkbox
            id="pro-terms"
            checked={data.acceptTerms}
            onChange={(v) => update({ acceptTerms: v })}
          >
            I agree to the{" "}
            <a
              className="font-bold hover:underline"
              style={{ color: "#004AC6" }}
              href="/terms-of-service"
            >
              Terms &amp; Conditions
            </a>
          </Checkbox>
          <Checkbox
            id="pro-privacy"
            checked={data.acceptPrivacy}
            onChange={(v) => update({ acceptPrivacy: v })}
          >
            I agree to the{" "}
            <a
              className="font-bold hover:underline"
              style={{ color: "#004AC6" }}
              href="/privacy-policy"
            >
              Privacy Policy
            </a>
          </Checkbox>
          <Checkbox
            id="pro-tos"
            checked={data.acceptTos}
            onChange={(v) => update({ acceptTos: v })}
          >
            I agree to the{" "}
            <a
              className="font-bold hover:underline"
              style={{ color: "#004AC6" }}
              href="/terms-of-service"
            >
              Terms of Service
            </a>
          </Checkbox>
        </div>
      </div>
    </SignupLayout>
  );
};

export default ProStep5;
