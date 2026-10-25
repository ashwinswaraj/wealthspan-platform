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

interface BillingData {
  clientType?: "individual" | "company";
  billingName?: string;
  billingAddress?: string;
  billingCountry?: string;
  billingState?: string;
  billingCity?: string;
  billingPincode?: string;
  currency?: string;
  billingEmail?: string;
  gstVat?: string;
  taxId?: string;
  acceptTerms?: boolean;
  acceptPrivacy?: boolean;
  acceptTos?: boolean;
}

const ClientStep4 = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<BillingData>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setData(loadSignup<BillingData>("client"));
  }, []);

  const update = (patch: Partial<BillingData>) => setData((d) => ({ ...d, ...patch }));

  const isCompany = data.clientType === "company";

  const requiredBase = !!(
    data.billingName?.trim() &&
    data.billingAddress?.trim() &&
    data.billingCountry?.trim() &&
    data.billingState?.trim() &&
    data.billingCity?.trim() &&
    data.billingPincode?.trim() &&
    data.currency?.trim() &&
    data.billingEmail?.trim()
  );
  const taxValid = isCompany ? !!(data.gstVat?.trim() && data.taxId?.trim()) : true;
  const consents = !!(data.acceptTerms && data.acceptPrivacy && data.acceptTos);
  const isValid = requiredBase && taxValid && consents;

  // Final step only — this is where the spinner appears.
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    saveSignup("client", { ...data, completedAt: new Date().toISOString() });
    // In production, send to backend here. Keep signup data so the dashboard can greet the user.
    await new Promise((r) => setTimeout(r, 900));
    navigate("/dashboard/client");
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
      currentStep={4}
      totalSteps={4}
      steps={CLIENT_STEPS}
      stepTitle="Billing details"
      stepDescription="We use these for invoicing, tax compliance and payment routing."
      heroTitle={<>Set up your billing on {gradientSpan("Jobrio.")}</>}
      heroSubtitle="Add your billing details so we can handle invoicing, tax compliance, and seamless payment routing."
      onBack={() => navigate("/signup/client/step-3")}
      onContinue={handleSubmit}
      continueDisabled={!isValid}
      continueLabel="Submit application"
      submitting={submitting}
      submittingLabel="Creating your account…"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldShell label="Billing name" required className="md:col-span-2">
            <TextInput
              value={data.billingName ?? ""}
              onChange={(e) => update({ billingName: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Billing address" required className="md:col-span-2">
            <TextInput
              value={data.billingAddress ?? ""}
              onChange={(e) => update({ billingAddress: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Country" required>
            <TextInput
              value={data.billingCountry ?? ""}
              onChange={(e) => update({ billingCountry: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="State" required>
            <TextInput
              value={data.billingState ?? ""}
              onChange={(e) => update({ billingState: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="City" required>
            <TextInput
              value={data.billingCity ?? ""}
              onChange={(e) => update({ billingCity: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Pincode" required>
            <TextInput
              value={data.billingPincode ?? ""}
              onChange={(e) => update({ billingPincode: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Preferred currency" required>
            <SelectInput
              value={data.currency ?? ""}
              onChange={(e) => update({ currency: e.target.value })}
            >
              <option value=""></option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="INR">INR — Indian Rupee</option>
              <option value="AED">AED — UAE Dirham</option>
              <option value="SGD">SGD — Singapore Dollar</option>
            </SelectInput>
          </FieldShell>
          <FieldShell label="Billing email" required>
            <TextInput
              type="email"
              value={data.billingEmail ?? ""}
              onChange={(e) => update({ billingEmail: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="GST / VAT" required={isCompany}>
            <TextInput
              value={data.gstVat ?? ""}
              onChange={(e) => update({ gstVat: e.target.value })}
            />
          </FieldShell>
          <FieldShell label="Tax ID" required={isCompany}>
            <TextInput
              value={data.taxId ?? ""}
              onChange={(e) => update({ taxId: e.target.value })}
            />
          </FieldShell>
        </div>

        <div className="space-y-3">
          <Checkbox
            id="accept-terms"
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
            id="accept-privacy"
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
            id="accept-tos"
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

export default ClientStep4;
